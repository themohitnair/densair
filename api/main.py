from services.extract import Extractor
from services.acquire import fetch_arxiv_pdf_bytes
from services.search import TermSearcher

from models import EndResponse, TermAugmenters
from config import LOG_CONFIG

from fastapi import FastAPI
import logging.config
import json

logging.config.dictConfig(LOG_CONFIG)
logger = logging.getLogger(__name__)


app = FastAPI()


@app.get("/arxiv/{arxiv_id}")
async def process_arxiv(arxiv_id: str) -> EndResponse:
    arxiv_link = f"https://arxiv.org/pdf/{arxiv_id}"
    pdf_bytes = await fetch_arxiv_pdf_bytes(arxiv_link)

    extractor = Extractor(pdf_bytes)

    terms_and_summaries = await extractor.sectionwise_explanations()
    image_summaries = await extractor.image_summaries()
    overall_summary = await extractor.overall_explanation()

    return EndResponse(
        overall_summary=json.loads(overall_summary),
        terms_and_summaries=json.loads(terms_and_summaries),
        figure_summaries=json.loads(image_summaries),
    )


@app.get("/search/{term}")
async def search_term(term: str) -> TermAugmenters:
    searcher = TermSearcher()
    augmenters = await searcher.get_augmenters(term)
    return TermAugmenters(key_term=term, term_augmenters=augmenters)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
