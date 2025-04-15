from config import (
    TOGETHER_KEY,
    UPSTASH_URL,
    UPSTASH_TOKEN,
    LOG_CONFIG,
    RAG_SYSTEM_PROMPT,
)

from services.acquire import ArxivPDF

from together import Together
from chonkie import RecursiveChunker, RecursiveRules
from upstash_vector import Index, Vector
from upstash_vector.types import QueryResult
from transformers import AutoTokenizer
from typing import List
import logging

logging.config.dictConfig(LOG_CONFIG)


class VecService:
    def __init__(self, arxiv_id: str, conv_id: str):
        self.arxiv_id = arxiv_id
        self.conv_id = conv_id
        self.model = "sentence-transformers/all-MiniLM-L6-v2"
        self.embedding_model = "BAAI/bge-base-en-v1.5"
        self.pdf = ArxivPDF(arxiv_id)
        self.client = Together(api_key=TOGETHER_KEY)
        self.tokenizer = AutoTokenizer.from_pretrained(self.model)
        self.chunker = RecursiveChunker(
            chunk_size=256,
            rules=RecursiveRules(),
            tokenizer_or_token_counter=self.tokenizer,
            return_type="texts",
        )
        self.index = Index(url=UPSTASH_URL, token=UPSTASH_TOKEN)
        self.logger = logging.getLogger(__name__)

    async def chunk_and_embed_pdf(self) -> List[Vector]:
        try:
            pdf_md = await self.pdf.fetch_arxiv_pdf_markdown()
            chunks = self.chunker.chunk(pdf_md)

            response = self.client.embeddings.create(
                model=self.embedding_model,
                input=chunks,
            ).data

            embeddings = [response[i].embedding for i in range(len(chunks))]

            vecs = [
                Vector(
                    id=f"{self.conv_id}_{i}",
                    vector=embedding,
                    metadata={"chunk": chunk},
                )
                for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
            ]
            return vecs
        except Exception as e:
            self.logger.error(f"Error in chunk_and_embed_pdf: {e}", exc_info=True)
            return None

    def insert_vectors(self, vecs: List[Vector]):
        try:
            self.index.upsert(vectors=vecs, namespace=self.conv_id)
        except Exception as e:
            self.logger.error(f"Error in insert_vectors: {e}", exc_info=True)

    def query_index(self, query: str, top_k: int = 5) -> List[QueryResult] | None:
        try:
            self.logger.info(
                f"Starting query for: '{query}' in namespace '{self.conv_id}'."
            )

            result = self.client.embeddings.create(
                model=self.embedding_model,
                input=[query],
            ).data

            query_vec = result[0].embedding
            results = self.index.query(
                vector=query_vec,
                top_k=top_k,
                namespace=self.conv_id,
                include_metadata=True,
            )
            self.logger.info(f"Query completed. Found {len(results)} results.")
            chunks = [results[i].metadata["chunk"] for i in range(len(results))]

            context = ""
            for chunk in chunks:
                context += chunk + "\n\n"

            self.logger.info("Context assembled.")
            self.logger.info(f"Query: {query} | Context Length: {len(context)}")

            response = self.client.chat.completions.create(
                model="meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
                messages=[
                    {
                        "role": "system",
                        "content": RAG_SYSTEM_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": f"Answer the question: {query}. Use only information provided here: {context}",
                    },
                ],
            )
            return response.choices[0].message.content
        except Exception as e:
            self.logger.error(f"Error in query_index: {e}", exc_info=True)
            return None

    def dispose_vectors_by_namespace(self) -> bool:
        try:
            self.index.delete_namespace(self.conv_id)
            return True
        except Exception as e:
            self.logger.error(f"Error deleting namespace {self.conv_id}: {e}")
            return False

    def vectors_exist(self) -> bool:
        try:
            result = self.index.fetch(ids=[f"{self.conv_id}_0"], namespace=self.conv_id)
            return len(result) > 0
        except Exception as e:
            self.logger.error(f"Error checking vector existence: {e}", exc_info=True)
            return False
