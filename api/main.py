from config import LOG_CONFIG, API_KEY

from services.acquire import ArxivPDF
from services.extract import Extractor
from services.search import TermSearcher
from services.vector import VecService
from services.feed import Feed

import io
import time
import asyncio
import random
from typing import List, Optional, Dict, Any
from functools import lru_cache
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from fastapi import FastAPI, Request, Header, HTTPException, Depends, Query, Path, Body
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging.config

from models import SearchResult, QueryRequest

logging.config.dictConfig(LOG_CONFIG)
logger = logging.getLogger(__name__)


@lru_cache(maxsize=100)
def _verify_api_key_cached(api_key: str) -> bool:
    return api_key == API_KEY


def verify_api_key(x_api_key: str = Header(None)):
    """Verify the API key with caching for better performance"""
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key is required")

    if not _verify_api_key_cached(x_api_key):
        logger.warning("Invalid API key attempt")
        raise HTTPException(status_code=403, detail="Invalid API key")


limiter = Limiter(
    key_func=get_remote_address, default_limits=["200/minute"], strategy="fixed-window"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting DensAIR API server")
    yield
    logger.info("Shutting down DensAIR API server")


app = FastAPI(
    title="DensAIR API",
    description="API for the DensAIR research paper search engine",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan,
)

app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://densair.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

active_requests: Dict[str, Dict[str, Any]] = {}


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    logger.warning(f"Rate limit exceeded: {request.client.host}")
    retry_after = getattr(exc, "retry_after", 60)
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": "Please try again later",
            "retry_after": retry_after,
        },
        headers={"Retry-After": str(retry_after)},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
        },
    )


@app.middleware("http")
async def track_requests(request: Request, call_next):
    request_id = f"{time.time()}-{request.client.host}-{request.url.path}"
    start_time = time.time()

    active_requests[request_id] = {
        "path": request.url.path,
        "method": request.method,
        "client": request.client.host,
        "start_time": start_time,
    }

    try:
        response = await call_next(request)
        return response
    finally:
        duration = time.time() - start_time
        logger.info(
            f"Request {request.method} {request.url.path} completed in {duration:.3f}s"
        )

        if request_id in active_requests:
            del active_requests[request_id]


@app.get("/arxiv/{arxiv_id}")
@limiter.limit("10/minute")
async def process_pdf(
    request: Request,
    arxiv_id: str,
    _: str = Depends(verify_api_key),
):
    """Process a PDF and return summaries of its content"""
    start_time = time.time()
    arxiv_id = arxiv_id.strip().lower()

    if not arxiv_id or len(arxiv_id) < 6:
        raise HTTPException(status_code=400, detail="Invalid arXiv ID format")

    try:
        async with ArxivPDF(arxiv_id) as pdf:
            try:
                pdf_bytes = await pdf.fetch_arxiv_pdf_bytes()
            except Exception as fetch_error:
                logger.error(f"Error fetching PDF {arxiv_id}: {fetch_error}")
                raise HTTPException(
                    status_code=404,
                    detail="Could not fetch PDF. Please check the arXiv ID and try again.",
                )

        try:
            extractor = Extractor(pdf_bytes)
            summaries = await asyncio.wait_for(
                extractor.get_all_summaries(),
                timeout=100.0,
            )
            logger.info(f"PDF {arxiv_id} processed in {time.time() - start_time:.2f}s")
            return summaries

        except asyncio.TimeoutError:
            logger.error(f"Timeout processing PDF {arxiv_id}")
            raise HTTPException(
                status_code=408,
                detail="Processing timed out. The PDF may be too large or complex.",
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing PDF {arxiv_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process PDF")


@app.get("/audiosumm/{arxiv_id}")
@limiter.limit("1/day")
async def get_aud_summ(
    request: Request,
    arxiv_id: str,
    _: str = Depends(verify_api_key),
):
    """Generate and stream an audio summary for the given paper"""
    try:
        async with ArxivPDF(arxiv_id) as pdf:
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
        logger.error(
            f"Failed to generate audio summary for {arxiv_id}: {e}", exc_info=True
        )
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


@app.post("/process/{arxiv_id}")
async def process_paper(
    arxiv_id: str = Path(..., min_length=6, description="arXiv ID of the paper"),
    _apikey: str = Depends(verify_api_key),
):
    arxiv_id = arxiv_id.strip().lower()

    vec = VecService(arxiv_id)

    if await vec.vectors_exist():
        return {
            "status": "success",
            "message": f"{arxiv_id} was already processed; vectors are ready.",
        }

    vectors = await vec.chunk_and_embed_pdf()
    if not vectors:
        raise HTTPException(
            status_code=500, detail="Failed to extract text or create embeddings."
        )

    try:
        await vec.insert_vectors(vectors)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to insert vectors: {e}")
    return {
        "status": "success",
        "message": f"{arxiv_id} processed successfully and is ready for queries.",
    }


@app.post("/query/{arxiv_id}")
async def query_paper(
    arxiv_id: str = Path(..., min_length=6, description="arXiv paper ID"),
    payload: QueryRequest = Body(...),
    _: str = Depends(verify_api_key),
):
    start = time.time()
    arxiv_id = arxiv_id.strip().lower()

    if not await VecService(arxiv_id).vectors_exist():
        raise HTTPException(400, "Paper not processed yet. Call /process first.")

    try:
        answer = await asyncio.wait_for(
            VecService(arxiv_id).query_index(payload.query, payload.top_k), timeout=30.0
        )
    except asyncio.TimeoutError:
        logger.error(f"Timeout for {arxiv_id}: {payload.query}")
        raise HTTPException(408, "Query timed out. Try a simpler question.")
    except Exception as e:
        logger.exception(f"Error querying {arxiv_id}", exc_info=e)
        raise HTTPException(500, "Internal Server Error during vector search")

    elapsed = round(time.time() - start, 2)
    return {"status": "success", "answer": answer, "processing_time": elapsed}


@app.get("/feed", response_model=List[SearchResult])
@limiter.limit("40/minute")
async def get_user_feed(
    request: Request,
    interests: List[str] = Query(
        ..., description="Pass ?interests=cs&interests=math etc."
    ),
    limit: int = Query(100, ge=1, le=200),
    exploration_ratio: float = Query(
        0.3, ge=0.0, le=1.0, description="Ratio of exploration content (0.0-1.0)"
    ),
    _: str = Depends(verify_api_key),
):
    start_time = time.time()

    if not interests:
        raise HTTPException(status_code=400, detail="Interests list cannot be empty")

    interests = [i.strip().lower() for i in interests if i.strip()]
    if not interests:
        raise HTTPException(
            status_code=400, detail="Interests contain only empty values"
        )

    if len(interests) < 2:
        raise HTTPException(
            status_code=400, detail="At least two different interests must be provided"
        )

    try:
        async with Feed() as feed:
            results = await asyncio.wait_for(
                feed.get_mixed_feed(user_interests=interests, total_items=limit),
                timeout=15.0,
            )
            logger.info(
                f"Mixed feed generated: {len(results)} results for {interests} in {time.time() - start_time:.2f}s"
            )
            return results

    except asyncio.TimeoutError:
        logger.error(f"Timeout while generating mixed feed for interests: {interests}")
        raise HTTPException(status_code=408, detail="Feed generation timed out.")
    except Exception as e:
        logger.error(f"Failed to fetch mixed feed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch user feed")


@app.get("/search", response_model=List[SearchResult])
@limiter.limit("30/minute")
async def search_papers(
    request: Request,
    query: Optional[str] = Query(None),
    categories: Optional[List[str]] = Query(None),
    categories_match_all: bool = Query(False),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    _: str = Depends(verify_api_key),
):
    start_time = time.time()

    if not query and not categories:
        raise HTTPException(
            status_code=400, detail="Either query or categories must be provided"
        )

    categories = [cat.strip().lower() for cat in categories or [] if cat.strip()]

    try:
        async with Feed() as feed:
            results = await asyncio.wait_for(
                feed.search_papers_request(
                    query=query,
                    categories=categories,
                    categories_match_all=categories_match_all,
                    date_from=date_from,
                    date_to=date_to,
                    limit=limit,
                ),
                timeout=10.0,
            )

            logger.info(
                f"Search returned {len(results)} results in {time.time() - start_time:.2f}s"
            )
            return results

    except asyncio.TimeoutError:
        logger.error(f"Timeout for search: query={query}, categories={categories}")
        raise HTTPException(status_code=408, detail="Search timed out.")
    except Exception as e:
        logger.error(f"Error during search: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to search papers")


@app.get("/similar", response_model=List[SearchResult])
@limiter.limit("20/minute")
async def get_similar_feed(
    request: Request,
    title: str = Query(...),
    limit: int = Query(5),
    _: str = Depends(verify_api_key),
):
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")

    try:
        async with Feed() as feed:
            results = await feed.similar_to_title(title, top_k=limit + 1)
            return results[1:]
    except Exception as e:
        logger.error(
            f"Failed to get similar papers for title '{title}': {e}", exc_info=True
        )
        raise HTTPException(status_code=500, detail="Failed to fetch similar papers")


@app.get(
    "/id/{paper_id}",
    response_model=SearchResult,
    response_model_exclude_none=True,
    summary="Get a paper by arXiv ID",
)
async def get_paper(paper_id: str):
    """
    Look up a paper by its arXiv ID using the microservice.
    Returns 404 if the paper is not found.
    """
    async with Feed() as feed:
        result = await feed.get_paper_by_id(paper_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Paper '{paper_id}' not found")
    return result


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "active_requests": len(active_requests),
        "timestamp": time.time(),
    }
