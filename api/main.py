from config import LOG_CONFIG

from services.acquire import ArxivPDF
from services.extract import Extractor
from services.search import TermSearcher
from services.vector import VecService

from models import DocumentProcessStatus

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.responses import JSONResponse

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging.config

logging.config.dictConfig(LOG_CONFIG)
logger = logging.getLogger(__name__)


limiter = Limiter(key_func=get_remote_address)

app = FastAPI()
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"error": "Rate limit exceeded. Please try again later."},
    )


@app.get("/arxiv/{arxiv_id}")
@limiter.limit("5/minute")
async def process_pdf(arxiv_id: str):
    pdf = ArxivPDF(arxiv_id)
    pdf_bytes = await pdf.fetch_arxiv_pdf_bytes()

    extractor = Extractor(pdf_bytes)

    summaries = await extractor.get_all_summaries()

    return summaries


@app.get("/term/{term}")
@limiter.limit("50/minute")
async def get_term_augmenters(term: str):
    searcher = TermSearcher(term)

    augmenters = await searcher.get_augmenters()

    return augmenters


@app.post("/process/{arxiv_id}/{conv_id}")
@limiter.limit("2/minute")
async def process_paper(arxiv_id: str, conv_id: str):
    v = VecService(arxiv_id, conv_id)

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
@limiter.limit("100/minute")
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
            logger.warning(f"Namespace {conv_id} does not exist, skipping deletion.")
            return {
                "status": "error",
                "message": f"Namespace {conv_id} does not exist or was already deleted.",
            }

        success = v.dispose_vectors_by_namespace()
        if not success:
            raise Exception("Failed to delete vectors")

        return {
            "status": "success",
            "message": f"Conversation {conv_id} and all associated vectors have been deleted.",
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
