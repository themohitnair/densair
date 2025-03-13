from pydantic import BaseModel
from typing import List


class ImageSumm(BaseModel):
    image_fig_num: str
    image_summary: str


class Response(BaseModel):
    abs_explanation: str
    meth_explanation: str
    conc_explanation: str
    image_summaries: list[ImageSumm]
    key_terms: List[str]
