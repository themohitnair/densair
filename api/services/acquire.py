from config import LOG_CONFIG, LLAMA_KEY

import aiohttp
import asyncio
import pymupdf
import logging.config
import tempfile
import os
from llama_parse import LlamaParse

logging.config.dictConfig(LOG_CONFIG)


class ArxivPDF:
    def __init__(self, arxiv_id: str):
        self.arxiv_url = f"https://arxiv.org/pdf/{arxiv_id}"
        self.llama_parser = LlamaParse(
            api_key=LLAMA_KEY, result_type="markdown", verbose=False
        )
        self.logger = logging.getLogger(__name__)
        self._session = None
        self._pdf_bytes_cache = None

    async def _get_session(self):
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession()
        return self._session

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
            self._session = None

    async def is_valid_pdf_url(self) -> bool:
        try:
            session = await self._get_session()
            async with session.head(self.arxiv_url) as response:
                if response.status != 200:
                    self.logger.error(f"URL returned status code {response.status}")
                    return False

                content_type = response.headers.get("Content-Type", "").lower()
                if "pdf" not in content_type:
                    self.logger.error("The file is not a PDF (Content-Type mismatch).")
                    return False

            session = await self._get_session()

            async with session.get(
                self.arxiv_url, headers={"Range": "bytes=0-4"}
            ) as response:
                first_bytes = await response.content.read()
                if first_bytes != b"%PDF-":
                    self.logger.error("The file does not have a valid PDF signature.")
                    return False

            return True
        except aiohttp.ClientError as e:
            self.logger.error(f"Network error while validating PDF: {e}")
            return False
        except Exception as e:
            self.logger.error(
                f"An unexpected error occurred while validating the PDF URL: {e}"
            )
            return False

    async def fetch_arxiv_pdf_bytes(self) -> bytes | None:
        if self._pdf_bytes_cache is not None:
            return self._pdf_bytes_cache

        if not await self.is_valid_pdf_url():
            return None

        try:
            session = await self._get_session()
            async with session.get(self.arxiv_url) as response:
                pdf_bytes = await response.read()

            doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
            self.logger.info(
                f"Success: PDF verification passed. Number of pages: {len(doc)}"
            )
            self._pdf_bytes_cache = pdf_bytes
            return pdf_bytes
        except aiohttp.ClientError as e:
            self.logger.error(f"Network error while fetching PDF: {e}")
            return None
        except Exception as e:
            self.logger.error(
                f"An error occurred while fetching PDF Bytes from ArXiv: {e}"
            )

    async def fetch_arxiv_pdf_markdown(self) -> str | None:
        pdf_bytes = await self.fetch_arxiv_pdf_bytes()
        if not pdf_bytes:
            return None

        temp_file_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
                temp_file_path = temp_file.name
                temp_file.write(pdf_bytes)

            self.logger.info(f"Parsing PDF from {self.arxiv_url} with LlamaParse")

            try:
                documents = await self.llama_parser.aload_data(temp_file_path)
            except Exception as e:
                self.logger.error(f"Unexpected LlamaParse error: {e}")
                return None

            if not documents:
                self.logger.error("LlamaParse returned an empty response.")
                return None

            markdown_content = (
                "\n\n".join([str(doc.text) for doc in documents])
                if isinstance(documents, list)
                else str(documents.text)
            )

            self.logger.info("PDF successfully converted to markdown.")
            return markdown_content
        except Exception as e:
            self.logger.error(f"Error converting PDF to markdown: {e}")
            return None
        finally:
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.unlink(temp_file_path)
                except Exception as e:
                    self.logger.warning(
                        f"Failed to delete temporary file {temp_file_path}: {e}"
                    )

    def __del__(self):
        if self._session:
            asyncio.create_task(self.close())
