from pydantic import BaseModel, Field, model_validator, ValidationInfo, field_validator
from typing import Self, Optional, Any


class DensairInput(BaseModel):
    start_page: int = Field(default=1, ge=1)
    end_page: Optional[int] = Field(default=None, ge=1)

    @model_validator(mode="after")
    def page_range_check(self) -> Self:
        if self.end_page is not None and self.start_page > self.end_page:
            raise ValueError(
                "start_page must always be less than or equal to end_page."
            )
        return self

    @field_validator("start_page", "end_page", mode="before")
    @classmethod
    def page_value_check(cls, v: Any, info: ValidationInfo):
        if v is None:
            return v

        if isinstance(v, str):
            if not v.isdigit():
                raise ValueError(f"'{v}' is not a valid integer page number.")
            return int(v)

        if not isinstance(v, int):
            raise TypeError(f"Expected an integer, but got {type(v).__name__}.")
        return v
