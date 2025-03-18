from config import LOG_CONFIG, FIRST_PROMPT, SECOND_PROMPT, THIRD_PROMPT, GEM_KEY

from models import TermsAndSummaries, FigureSummaries, OverallSummary, EndResponse

from google import genai
from google.genai import types
import logging.config
import json

logging.config.dictConfig(LOG_CONFIG)
logger = logging.getLogger(__name__)


class Extractor:
    def __init__(
        self,
        pdf_bytes: bytes,
        model_name: str = "gemini-2.0-flash-lite",
    ):
        logging.config.dictConfig(LOG_CONFIG)
        logger = logging.getLogger(__name__)
        self.bytes = pdf_bytes
        self.client = genai.Client(api_key=GEM_KEY)
        self.logger = logger

    async def sectionwise_explanations(self) -> TermsAndSummaries:
        response = await self.client.aio.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=[
                types.Part.from_bytes(
                    data=self.bytes,
                    mime_type="application/pdf",
                ),
                FIRST_PROMPT,
            ],
            config={
                "response_mime_type": "application/json",
                "response_schema": TermsAndSummaries,
            },
        )
        self.logger.info("Sectionwise explanations received.")
        return response.text

    async def figure_summaries(self) -> FigureSummaries:
        response = await self.client.aio.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=[
                types.Part.from_bytes(
                    data=self.bytes,
                    mime_type="application/pdf",
                ),
                SECOND_PROMPT,
            ],
            config={
                "response_mime_type": "application/json",
                "response_schema": FigureSummaries,
            },
        )
        self.logger.info("Image summaries received.")
        return response.text

    async def overall_explanation(self) -> OverallSummary:
        response = await self.client.aio.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=[
                types.Part.from_bytes(
                    data=self.bytes,
                    mime_type="application/pdf",
                ),
                THIRD_PROMPT,
            ],
            config={
                "response_mime_type": "application/json",
                "response_schema": OverallSummary,
            },
        )
        self.logger.info("Overall explanation received.")
        return response.text

    async def get_all_summaries(self) -> EndResponse:
        overall_summary = await self.overall_explanation()
        sectionwise_explanations = await self.sectionwise_explanations()
        figure_summaries = await self.figure_summaries()

        return EndResponse(
            overall_summary=json.loads(overall_summary),
            terms_and_summaries=json.loads(sectionwise_explanations),
            figure_summaries=json.loads(figure_summaries),
        )
