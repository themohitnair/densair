from config import TOGETHER_KEY
from services.acquire import ArxivPDF
from typing import List
from together import Together
from chonkie import RecursiveChunker, RecursiveRules
from sentence_transformers import SentenceTransformer
import faiss
from transformers import AutoTokenizer


class VecService:
    def __init__(self, arxiv_id: str, session_id: str):
        self.model = "sentence-transformers/all-MiniLM-L6-v2"
        self.pdf = ArxivPDF(arxiv_id)
        self.client = Together(api_key=TOGETHER_KEY)
        self.embedding_model = SentenceTransformer(self.model)
        self.tokenizer = AutoTokenizer.from_pretrained(self.model)
        self.chunker = RecursiveChunker(
            chunk_size=256,
            rules=RecursiveRules(),
            tokenizer_or_token_counter=self.tokenizer,
            return_type="texts",
        )
        self.index = faiss.IndexFlatL2(384)

    async def chunk_pdf(self) -> List[str]:
        pdf_md = await self.pdf.fetch_arxiv_pdf_markdown()
        chunks = self.chunker.chunk(pdf_md)
        for i, chunk in enumerate(chunks):
            print(f"Chunk {i}: {chunk}")
        return chunks

    async def embed_and_insert_chunks(self, batch_size=32):
        chunks = await self.chunk_pdf()

        for i in range(0, len(chunks), batch_size):
            batch = chunks[i : i + batch_size]
            batch_embeddings = self.embedding_model.encode(batch, convert_to_numpy=True)
            self.index.add(batch_embeddings)
            print(f"Inserted batch {i // batch_size + 1} into the index")
