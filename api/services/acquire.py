from config import LOG_CONFIG, LLAMA_KEY

import aiohttp
import pymupdf
import logging.config
import tempfile
import os
from llama_parse import LlamaParse

logging.config.dictConfig(LOG_CONFIG)
logger = logging.getLogger(__name__)


class ArxivPDF:
    def __init__(self, arxiv_id: str):
        self.arxiv_url = f"https://arxiv.org/pdf/{arxiv_id}"
        self.llama_parser = LlamaParse(
            api_key=LLAMA_KEY, result_type="markdown", verbose=False
        )

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

        temp_file_path = None
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.arxiv_url) as response:
                    pdf_bytes = await response.read()

            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
                temp_file_path = temp_file.name
                temp_file.write(pdf_bytes)

            logger.info(f"Parsing PDF from {self.arxiv_url} with LlamaParse")
            documents = await self.llama_parser.aload_data(temp_file_path)

            if isinstance(documents, list):
                markdown_content = "\n\n".join([str(doc.text) for doc in documents])
            else:
                markdown_content = str(documents.text)

            logger.info("PDF successfully converted to markdown using LlamaParse.")
            return markdown_content

        except Exception as e:
            logger.error(f"An error occurred while converting PDF to markdown: {e}")
            return None
        finally:
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.unlink(temp_file_path)
                except Exception as e:
                    logger.warning(
                        f"Failed to delete temporary file {temp_file_path}: {e}"
                    )
