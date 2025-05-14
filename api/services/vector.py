from config import (
    UPSTASH_URL,
    UPSTASH_TOKEN,
    LOG_CONFIG,
    RAG_SYSTEM_PROMPT,
    RAG_CHAT_MODEL,
    EMB_MODEL,
    TOKENIZING_MODEL,
    GROQ_KEY,
    CACHE_SIZE,
)

from services.acquire import ArxivPDF

from groq import AsyncGroq
from light_embed import TextEmbedding
from chonkie import RecursiveChunker, RecursiveRules
from upstash_vector import Index, Vector
from transformers import AutoTokenizer
from typing import List, Optional
import logging
import logging.config
import asyncio
from cachetools import LRUCache

logging.config.dictConfig(LOG_CONFIG)


class VecService:
    def __init__(self, arxiv_id: str):
        self.arxiv_id = arxiv_id.lower()
        self.model = TOKENIZING_MODEL
        self.embedding_model = EMB_MODEL
        self.embedding_client = TextEmbedding(self.embedding_model)
        self.client = AsyncGroq(api_key=GROQ_KEY)
        self.tokenizer = AutoTokenizer.from_pretrained(self.model)
        self.chunker = RecursiveChunker(
            chunk_size=256,
            rules=RecursiveRules(),
            tokenizer_or_token_counter=self.tokenizer,
            return_type="texts",
        )
        self.index = Index(url=UPSTASH_URL, token=UPSTASH_TOKEN)
        self.logger = logging.getLogger(__name__)
        self.embedding_cache = LRUCache(maxsize=CACHE_SIZE)
        self.semaphore = asyncio.Semaphore(5)  # Limit concurrent embedding operations

    async def _embed_text(self, text: str) -> Optional[List[float]]:
        """Embed a single text with caching and error handling"""
        if not text or not text.strip():
            self.logger.warning("Cannot embed empty text")
            return None

        # Truncate extremely long texts
        if len(text) > 1000:
            self.logger.warning(
                f"Text too long ({len(text)} chars), truncating to 1000 chars"
            )
            text = text[:1000]

        # Check cache
        if text in self.embedding_cache:
            self.logger.debug("Cache hit for text embedding")
            return self.embedding_cache[text]

        try:
            async with self.semaphore:
                # Run embedding in executor to make it non-blocking
                loop = asyncio.get_event_loop()
                embedding_future = loop.run_in_executor(
                    None, lambda: self.embedding_client.encode([text])[0]
                )

                # Add timeout
                embedding = await asyncio.wait_for(embedding_future, timeout=10.0)

                if embedding is None or len(embedding) == 0:
                    self.logger.error("Empty embedding vector received")
                    return None

                # Cache the result
                self.embedding_cache[text] = embedding
                return embedding

        except asyncio.TimeoutError:
            self.logger.error("Timeout while embedding text")
            return None
        except Exception as e:
            self.logger.error(f"Error embedding text: {e}")
            return None

    async def _embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Embed a batch of texts with error handling"""
        if not texts:
            return []

        try:
            # Try direct batch embedding first
            try:
                async with self.semaphore:
                    loop = asyncio.get_event_loop()
                    # Remove the extra list wrapper around texts
                    embedding_future = loop.run_in_executor(
                        None,
                        lambda: self.embedding_client.encode(
                            texts
                        ),  # texts is already a list
                    )

                    embeddings = await asyncio.wait_for(embedding_future, timeout=30.0)
                    if embeddings is not None and len(embeddings) == len(texts):
                        self.logger.info(
                            f"Successfully batch embedded {len(embeddings)} texts"
                        )
                        # Cache individual embeddings
                        for text, embedding in zip(texts, embeddings):
                            self.embedding_cache[text] = embedding
                        return embeddings
                    else:
                        self.logger.warning(
                            "Batch embedding returned incomplete results, falling back to individual embedding"
                        )
            except Exception as e:
                self.logger.warning(
                    f"Batch embedding failed: {e}, falling back to individual embedding"
                )

            # Fallback to individual embedding with validation
            valid_embeddings = []
            for text in texts:
                if not isinstance(text, str) or not text.strip():
                    self.logger.warning("Skipping invalid text for embedding")
                    continue

                embedding = await self._embed_text(text)
                if embedding:
                    valid_embeddings.append(embedding)

            return valid_embeddings

        except Exception as e:
            self.logger.error(f"Error in batch embedding: {e}")
            return []

    async def chunk_and_embed_pdf(self) -> list[Vector]:
        try:
            async with ArxivPDF(self.arxiv_id) as pdf:
                pdf_md = await pdf.fetch_arxiv_pdf_markdown()

            if not pdf_md:
                self.logger.error("No markdown extracted from PDF")
                return []

            chunks = self.chunker.chunk(pdf_md)
            self.logger.info(f"Generated {len(chunks)} chunks from PDF")

            embeddings = await self._embed_batch(chunks)
            valid_chunks = chunks[: len(embeddings)]
            self.logger.info(f"Embedded {len(embeddings)}/{len(chunks)} chunks")
            vecs = [
                Vector(
                    id=f"{self.arxiv_id}_{i}",
                    vector=emb,
                    metadata={"chunk": chunk},
                )
                for i, (chunk, emb) in enumerate(zip(valid_chunks, embeddings))
            ]
            self.logger.info(f"Created {len(vecs)} vectors for insertion")
            return vecs

        except Exception as e:
            self.logger.error(f"Error in chunk_and_embed_pdf: {e}", exc_info=True)
            return []

    async def insert_vectors(self, vecs: List[Vector]):
        try:
            if not vecs:
                self.logger.warning("No vectors to insert")
                return

            self.index.upsert(vectors=vecs, namespace=self.arxiv_id)
            self.logger.info(
                f"Successfully inserted {len(vecs)} vectors into namespace '{self.arxiv_id}'"
            )
        except Exception as e:
            self.logger.error(f"Error in insert_vectors: {e}", exc_info=True)

    async def query_index(self, query: str, top_k: int = 5) -> str:
        try:
            self.logger.info(
                f"Starting query for: '{query}' in namespace '{self.arxiv_id}'."
            )

            # Use async embedding with caching
            query_vec = await self._embed_text(query)

            if query_vec is None:
                self.logger.error("Failed to embed query")
                return "Sorry, I couldn't process your query at this time."

            results = self.index.query(
                vector=query_vec,
                top_k=top_k,
                namespace=self.arxiv_id,
                include_metadata=True,
            )
            self.logger.info(f"Query completed. Found {len(results)} results.")

            if not results:
                self.logger.warning("No results found in vector store")
                return "I couldn't find relevant information to answer your question."

            chunks = [results[i].metadata["chunk"] for i in range(len(results))]

            context = ""
            for chunk in chunks:
                context += chunk + "\n\n"

            self.logger.info("Context assembled.")
            self.logger.info(f"Query: {query} | Context Length: {len(context)}")

            response = await self.client.chat.completions.create(
                model=RAG_CHAT_MODEL,
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
            return "Sorry, an error occurred while processing your query."

    async def vectors_exist(self) -> bool:
        try:
            result = self.index.fetch(
                ids=[f"{self.arxiv_id}_0"], namespace=self.arxiv_id
            )
            self.logger.info(f"Fetch result for {self.arxiv_id}: {result}")

            return bool(result) and any(item is not None for item in result)
        except Exception as e:
            self.logger.error(f"Error checking vector existence: {e}", exc_info=True)
            return False
