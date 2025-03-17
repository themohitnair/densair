from config import LOG_CONFIG, LLAMA_KEY

import aiohttp
import pymupdf
import logging.config
from docling.document_converter import DocumentConverter
from docling.exceptions import ConversionError, OperationNotAllowed
from docling.datamodel.base_models import ConversionStatus
from llama_parse import LlamaParse

logging.config.dictConfig(LOG_CONFIG)
logger = logging.getLogger(__name__)


class ArxivPDF:
    def __init__(self, arxiv_id: str):
        self.arxiv_url = f"https://arxiv.org/pdf/{arxiv_id}"

    async def is_valid_pdf_url(self) -> bool:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.arxiv_url) as response:
                    content_type = response.headers.get("Content-Type", "").lower()
                    if "pdf" not in content_type:
                        logger.error("The file is not a PDF (Content-Type mismatch).")
                        return False

                    first_bytes = await response.content.read(5)
                    if first_bytes != b"%PDF-":
                        logger.error("The file does not have a valid PDF signature.")
                        return False

            return True
        except Exception as e:
            logger.error(
                f"An unexpected error occurred while validating the PDF URL: {e}"
            )
            return False

    async def fetch_arxiv_pdf_bytes(self) -> bytes | None:
        if not await self.is_valid_pdf_url():
            return None

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.arxiv_url) as response:
                    pdf_bytes = await response.read()

            doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
            logger.info(
                f"Success: PDF verification passed. Number of pages: {len(doc)}"
            )
            return pdf_bytes
        except Exception as e:
            logger.error(f"An error occurred while fetching the PDF: {e}")
            return None

    async def fetch_arxiv_pdf_markdown(self) -> str | None:
        if not await self.is_valid_pdf_url():
            return None

        converter = DocumentConverter()
        try:
            result = converter.convert(self.arxiv_url)
            if result.status == ConversionStatus.SUCCESS:
                txt = result.document.export_to_markdown()
                logger.info("PDF successfully converted to markdown.")
                return txt
            else:
                logger.error(f"Conversion failed with status: {result.status}")
                return None
        except OperationNotAllowed as e:
            logger.error(f"Operation not allowed: {e}")
            return None
        except ConversionError as e:
            logger.error(f"Conversion error: {e}")
            return None
        except Exception as e:
            logger.error(f"An unexpected error occurred: {e}")
            return None
