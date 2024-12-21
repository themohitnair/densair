from pydantic import BaseModel, model_validator, conint
from typing import Self
from config import logger


class PageRangeInput(BaseModel):
    start_page: conint(gt=0)
    end_page: conint(gt=0)
    num_pages: conint(gt=0)

    @model_validator(mode="after")
    def check_range_validity(self) -> Self:
        if self.start_page > self.end_page:
            message = "Page range is not valid. start_page value is greater than the end_page constraint."
            logger.error(message)
            raise ValueError(message)
        elif self.start_page > self.num_pages or self.end_page > self.num_pages:
            message = "Page range is not valid. Range is out of bounds (start_page, end_page, or both are greater than the total number of pages in the PDF document.)"
            logger.error(message)
            raise ValueError(message)
        return self


class EstimationResult(BaseModel):
    tokens: int
    price: float
    payment_link: str
