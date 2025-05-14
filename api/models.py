from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class ArxivDomains(str, Enum):
    CS = "cs"
    ECON = "econ"
    EESS = "eess"
    MATH = "math"
    ASTRO_PH = "astro-ph"
    COND_MAT = "cond-mat"
    GR_QC = "gr-qc"
    HEP = "hep"
    MATH_PH = "math-ph"
    NUCL = "nucl"
    QUANT_PH = "quant-ph"
    PHYSICS = "physics"
    Q_BIO = "q-bio"
    Q_FIN = "q-fin"
    STAT = "stat"
    NLIN = "nlin"


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
    context: str


class EndResponse(BaseModel):
    overall_summary: OverallSummary
    terms_and_summaries: TermsAndSummaries
    table_and_figure_summaries: FigureSummaries


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


class InVoiceSummary(BaseModel):
    title: str
    summary: str


class PaperMetadata(BaseModel):
    paper_id: str
    categories: List[str]
    authors: List[str]
    title: str
    date_updated: str


class SearchResult(BaseModel):
    distance: Optional[float] = None
    metadata: PaperMetadata


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5
