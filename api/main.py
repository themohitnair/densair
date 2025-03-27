from config import LOG_CONFIG, API_KEY

import time
import traceback

from services.acquire import ArxivPDF
from services.extract import Extractor
from services.search import TermSearcher
from services.vector import VecService

from models import DocumentProcessStatus

import io
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from fastapi import FastAPI, Request, Header, HTTPException, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import logging.config

logging.config.dictConfig(LOG_CONFIG)
logger = logging.getLogger(__name__)


def verify_api_key(x_api_key: str = Header(None)):
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
    try:
        pdf = ArxivPDF(arxiv_id)
        pdf_bytes = await pdf.fetch_arxiv_pdf_bytes()

        extractor = Extractor(pdf_bytes)
        summaries = await extractor.get_all_summaries()
        return summaries
    except Exception as e:
        logger.error(f"Error processing PDF {arxiv_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to process PDF")


@app.get("/audiosumm/{arxiv_id}")
@limiter.limit("1/day")
async def get_aud_summ(
    request: Request, arxiv_id: str, _: str = Depends(verify_api_key)
):
    try:
        pdf = ArxivPDF(arxiv_id)
        pdf_bytes = await pdf.fetch_arxiv_pdf_bytes()
        extractor = Extractor(pdf_bytes)
        audio, title = await extractor.generate_voice_summary()

        audio_bytes = audio["AudioStream"].read()
        audio_stream = io.BytesIO(audio_bytes)
        audio_stream.seek(0)

        return StreamingResponse(
            audio_stream,
            media_type="audio/mpeg",
            headers={
                "X-Title": title,
                "Content-Disposition": f'inline; filename="{arxiv_id}.mp3"',
            },
        )
    except Exception as e:
        logger.error(f"Failed to generate audio summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate audio summary")


@app.get("/term/{term}")
@limiter.limit("50/minute")
async def get_term_augmenters(
    request: Request, term: str, context: str, _: str = Depends(verify_api_key)
):
    try:
        searcher = TermSearcher(term, context)
        augmenters = await searcher.get_augmenters()
        return augmenters
    except Exception as e:
        logger.error(f"Error retrieving term augmenters: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve term augmenters"
        )


@app.post("/process/{arxiv_id}/{conv_id}")
@limiter.limit("2/minute")
async def process_paper(
    request: Request, arxiv_id: str, conv_id: str, _: str = Depends(verify_api_key)
):
    try:
        v = VecService(arxiv_id, conv_id)
        vecs = await v.chunk_and_embed_pdf()
        if vecs is None:
            raise HTTPException(status_code=500, detail="Failed to process the paper")
        v.insert_vectors(vecs)
        return DocumentProcessStatus(
            status="success", message="Paper processed and ready for queries"
        )
    except Exception as e:
        logger.error(f"Error processing paper {arxiv_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.get("/query/{arxiv_id}/{conv_id}")
@limiter.limit("100/minute")
async def query_paper(
    request: Request,
    arxiv_id: str,
    conv_id: str,
    query: str,
    _: str = Depends(verify_api_key),
):
    try:
        v = VecService(arxiv_id, conv_id)
        if not v.vectors_exist():
            raise HTTPException(
                status_code=400,
                detail="Paper not processed yet. Call /process endpoint first.",
            )
        response = v.query_index(query)
        if response is None:
            raise HTTPException(status_code=500, detail="Failed to retrieve an answer")
        return {"response": response}
    except Exception as e:
        logger.error(f"Error querying paper {arxiv_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.delete("/deleteconv/{conv_id}")
async def delete_conversation(conv_id: str, _: str = Depends(verify_api_key)):
    try:
        v = VecService(arxiv_id="dummy", conv_id=conv_id)
        if not v.vectors_exist():
            logger.info(f"Namespace {conv_id} doesn't exist, skipping deletion")
            return {"status": "success", "message": "No vectors to delete"}
        success = v.dispose_vectors_by_namespace()
        time.sleep(0.01)
        if not success:
            raise HTTPException(
                status_code=500, detail="Deletion attempted but may not have completed"
            )
        return {"status": "success", "message": "Vectors deleted"}
    except Exception as e:
        logger.error(f"Critical error deleting {conv_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
