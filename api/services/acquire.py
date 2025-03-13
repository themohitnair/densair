import aiohttp
from config import LOG_CONFIG
import fitz
import logging.config

logging.config.dictConfig(LOG_CONFIG)
logger = logging.getLogger(__name__)


async def fetch_arxiv_pdf_bytes(url: str) -> bytes | None:
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            content_type = response.headers.get("Content-Type", "").lower()
            if "pdf" not in content_type:
                logger.info("Error: The file is not a PDF (Content-Type mismatch).")
                raise ValueError(
                    "Error: The file is not a PDF (Content-Type mismatch)."
                )

            first_bytes = await response.content.read(5)
            if first_bytes != b"%PDF-":
                logger.info("Error: The file does not have a valid PDF signature.")
                raise ValueError("Error: The file does not have a valid PDF signature.")

            pdf_bytes = first_bytes + await response.read()

        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            print("Success: PDF verification passed. Number of pages:", len(doc))
            return pdf_bytes
        except Exception as e:
            logger.info(f"An error occurred while fetching the PDF. {e}")
            raise e
