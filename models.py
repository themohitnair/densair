from pydantic import BaseModel, field_validator
from typing import Optional


class DensairInput(BaseModel):
    start_page: int = 0
    end_page: Optional[int] = None

    @field_validator("start_page")
    def validate_start_page(cls, v: any, values: dict):
        if v is None or v < 1:
            raise ValueError("start_page must be greater than 0 (1-indexed).")
        return v

    @field_validator("end_page")
    def validate_end_page(cls, v: any, values: dict):
        start_page = values.get("start_page")
        if v is not None and v < start_page:
            raise ValueError("end_page must be greater than or equal to start_page.")
        return v
