from models import PDFInput
import pymupdf
from config import logger


async def extract(input: PDFInput):
    try:
        logger.info("Reading PDF File.")
        contents = await input.pdf_file.read()
        logger.info("PDF File read!")

        doc_stream = pymupdf.open(stream=contents, filetype="pdf")

        extracted_text = []
        logger.info("Extracting PDF Text.")
        for page_number in range(input.start_page - 1, input.end_page):
            page = doc_stream.load_page(page_number)
            text = page.get_text()
            extracted_text.append(text.strip())
        logger.info("PDF Text extracted.")

        return "\n".join(extracted_text)

    except Exception as e:
        logger.error("Unexpected error in PDF processing.")
        raise ValueError(f"Error processing PDF: {str(e)}")
