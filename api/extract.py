from models import PageRangeInput
import pymupdf
from fastapi import HTTPException
from config import logger
import tiktoken


async def count_pages(content: bytes):
    try:
        doc = pymupdf.open(stream=content, filetype="pdf")
        return doc.page_count
    except Exception as e:
        logger.error(f"Error reading the PDF: {e}")
        raise HTTPException(status_code=400, detail="Error reading the PDF file.")


async def extract(content: bytes, page_range: PageRangeInput):
    try:
        doc_stream = pymupdf.open(stream=content, filetype="pdf")

        extracted_text = []
        logger.info("Extracting PDF Text.")
        for page_number in range(page_range.start_page - 1, page_range.end_page):
            page = doc_stream.load_page(page_number)
            text = page.get_text()
            extracted_text.append(text.strip())
        logger.info("PDF Text extracted.")

        return "\n".join(extracted_text)

    except Exception as e:
        logger.error("Unexpected error in PDF processing.")
        raise ValueError(f"Error processing PDF: {str(e)}")


async def count_tokens(text: str):
    enc = tiktoken.encoding_for_model("gpt-4")
    return len(enc.encode(text))


async def estimate_price(token_count: int, price_per_token: int):
    return token_count * price_per_token
