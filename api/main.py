from config import LOG_CONFIG, API_KEY

import time

from services.acquire import ArxivPDF
from services.extract import Extractor
from services.search import TermSearcher
from services.vector import VecService

from models import DocumentProcessStatus

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.responses import JSONResponse

import os
import tempfile

from fastapi import FastAPI, Request, Header, HTTPException, Depends, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import logging.config

logging.config.dictConfig(LOG_CONFIG)
logger = logging.getLogger(__name__)


def verify_api_key(x_api_key: str = Header(None)):
    """Validate API key from request headers."""
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")


limiter = Limiter(key_func=get_remote_address)

app = FastAPI()
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://densair.vercel.app", "http://localhost:3000"],
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
async def process_pdf(
    request: Request, arxiv_id: str, _: str = Depends(verify_api_key)
):
    pdf = ArxivPDF(arxiv_id)
    pdf_bytes = await pdf.fetch_arxiv_pdf_bytes()

    extractor = Extractor(pdf_bytes)

    summaries = await extractor.get_all_summaries()

    return summaries


@app.get("/audiosumm/{arxiv_id}")
@limiter.limit("1/day")
async def get_aud_summ(
    request: Request,
    arxiv_id: str,
    background_tasks: BackgroundTasks,
    _: str = Depends(verify_api_key),
):
    pdf = ArxivPDF(arxiv_id)
    pdf_bytes = await pdf.fetch_arxiv_pdf_bytes()

    extractor = Extractor(pdf_bytes)
    aud_bytes = await extractor.generate_voice_summary()

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp.write(aud_bytes)
        tmp_path = tmp.name

    background_tasks.add_task(os.remove, tmp_path)

    return FileResponse(
        tmp_path,
        media_type="audio/mpeg",
        filename=f"{arxiv_id}.mp3",
        headers={
            "Content-Disposition": 'inline; filename="{}"'.format(f"{arxiv_id}.mp3")
        },
    )


@app.get("/term/{term}")
@limiter.limit("50/minute")
async def get_term_augmenters(
    request: Request, term: str, context: str, _: str = Depends(verify_api_key)
):
    searcher = TermSearcher(term, context)

    augmenters = await searcher.get_augmenters()

    return augmenters


@app.post("/process/{arxiv_id}/{conv_id}")
@limiter.limit("2/minute")
async def process_paper(
    request: Request, arxiv_id: str, conv_id: str, _: str = Depends(verify_api_key)
):
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
async def query_paper(
    request: Request,
    arxiv_id: str,
    conv_id: str,
    query: str,
    _: str = Depends(verify_api_key),
):
    v = VecService(arxiv_id, conv_id)

    if not v.vectors_exist():
        return {"error": "Paper not processed yet. Call /process endpoint first."}

    response = v.query_index(query)
    if response is None:
        return {"error": "Failed to retrieve an answer"}

    return {"response": response}


@app.delete("/deleteconv/{conv_id}")
async def delete_conversation(conv_id: str, _: str = Depends(verify_api_key)):
    try:
        v = VecService(arxiv_id="dummy", conv_id=conv_id)

        if not v.vectors_exist():
            logger.info(f"Namespace {conv_id} doesn't exist, skipping deletion")
            return {"status": "success", "message": "No vectors to delete"}

        success = v.dispose_vectors_by_namespace()

        time.sleep(0.01)

        return {
            "status": "success" if success else "error",
            "message": (
                "Vectors deleted"
                if success
                else "Deletion attempted but may not have completed"
            ),
        }
    except Exception as e:
        logger.error(f"Critical error deleting {conv_id}: {e}")
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
