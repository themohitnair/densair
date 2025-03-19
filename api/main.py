from services.acquire import ArxivPDF
from services.extract import Extractor
from services.search import TermSearcher
from services.vector import VecService

from models import DocumentProcessStatus

from config import LOG_CONFIG

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging.config

logging.config.dictConfig(LOG_CONFIG)
logger = logging.getLogger(__name__)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def greet():
    return {"message": "Welcome to the densAIr project!"}


@app.get("/arxiv/{arxiv_id}")
async def process_pdf(arxiv_id: str):
    pdf = ArxivPDF(arxiv_id)
    pdf_bytes = await pdf.fetch_arxiv_pdf_bytes()

    extractor = Extractor(pdf_bytes)

    summaries = await extractor.get_all_summaries()

    return summaries


@app.get("/term/{term}")
async def get_term_augmenters(term: str):
    searcher = TermSearcher(term)

    augmenters = await searcher.get_augmenters()

    return augmenters


@app.post("/process/{arxiv_id}/{conv_id}")
async def process_paper(arxiv_id: str, conv_id: str):
    v = VecService(arxiv_id, conv_id)

    if not v.vectors_exist():
        vecs = await v.chunk_and_embed_pdf()
        if vecs is None:
            return DocumentProcessStatus(
                status="failure",
                message="Failed to process the paper",
            )
        v.insert_vectors(vecs)

    return DocumentProcessStatus(
        status="success",
        message="Paper processed and ready for queries",
    )


@app.get("/query/{arxiv_id}/{conv_id}")
async def query_paper(arxiv_id: str, conv_id: str, query: str):
    v = VecService(arxiv_id, conv_id)

    if not v.vectors_exist():
        return {"error": "Paper not processed yet. Call /process endpoint first."}

    response = v.query_index(query)
    if response is None:
        return {"error": "Failed to retrieve an answer"}

    return {"response": response}


@app.delete("/deleteconv/{conv_id}")
async def delete_conversation(conv_id: str):
    try:
        v = VecService(arxiv_id="dummy", conv_id=conv_id)

        if not v.vectors_exist():
            return {
                "status": "error",
                "message": f"Namespace {conv_id} does not exist or was already deleted.",
            }

        v.dispose_vectors_by_namespace()

        return {
            "status": "success",
            "message": f"Conversation {conv_id} and all associated vectors have been deleted",
        }
    except Exception as e:
        logger.error(f"Error deleting conversation {conv_id}: {e}", exc_info=True)
        return {
            "status": "error",
            "message": f"Failed to delete conversation: {str(e)}",
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
