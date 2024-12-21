from pydantic import BaseModel, model_validator, conint
from typing import Self
from fastapi import UploadFile
import pymupdf
from config import logger


class PDFInput(BaseModel):
    pdf_file: UploadFile
    start_page: conint(gt=0)
    end_page: conint(gt=0)

    @model_validator(mode="after")
    async def check_range_validity(self) -> Self:
        contents = await self.pdf_file.file.read()

        doc = pymupdf.open(stream=contents, filetype="pdf")

        num_pages = doc.page_count
        logger.info("Computed number of pages in the PDF Document for validation.")

        if self.start_page > self.end_page:
            message = "Page range is not valid. start_page value is greater than the end_page constraint."
            logger.error(message)
            raise ValueError(message)
        elif self.start_page > num_pages or self.end_page > num_pages:
            message = "Page range is not valid. Range is out of bounds (start_page, end_page, or both are greater than the total number of pages in the PDF document.)"
            logger.error(message)
            raise ValueError(message)
        return self
