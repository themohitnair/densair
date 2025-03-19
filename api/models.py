from pydantic import BaseModel
from typing import List
from enum import Enum


class FigType(Enum):
    table = "table"
    image = "image"


class FigureSummary(BaseModel):
    figure_num: str
    figure_summary: str


class FigureSummaries(BaseModel):
    table_and_figure_summaries: List[FigureSummary]


class TermsAndSummaries(BaseModel):
    key_terms: List[str]
    abs_explanation: str
    meth_explanation: str
    conc_explanation: str


class OverallSummary(BaseModel):
    summary: str


class EndResponse(BaseModel):
    overall_summary: OverallSummary
    terms_and_summaries: TermsAndSummaries
    figure_summaries: FigureSummaries


class TermAugmenter(BaseModel):
    title: str
    url: str


class TermAugmenters(BaseModel):
    key_term: str
    term_augmenters: List[TermAugmenter]


class VectorMetadata(BaseModel):
    arxiv_id: str
    timestamp: str


class DocumentProcessStatus(BaseModel):
    status: str
    message: str
