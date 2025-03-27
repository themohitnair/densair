from config import (
    LOG_CONFIG,
    FIRST_PROMPT,
    SECOND_PROMPT,
    THIRD_PROMPT,
    VOICE_PROMPT,
    GEM_KEY,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
)

from models import (
    TermsAndSummaries,
    FigureSummaries,
    OverallSummary,
    EndResponse,
    InVoiceSummary,
)

from google import genai
from google.genai import types
import logging.config
import json
import asyncio
import boto3

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
        self.voice = boto3.client(
            "polly",
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name="ap-south-1",
        )

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
        (
            overall_summary,
            sectionwise_explanations,
            figure_summaries,
        ) = await asyncio.gather(
            self.overall_explanation(),
            self.sectionwise_explanations(),
            self.figure_summaries(),
        )

        return EndResponse(
            overall_summary=json.loads(overall_summary),
            terms_and_summaries=json.loads(sectionwise_explanations),
            table_and_figure_summaries=json.loads(figure_summaries),
        )

    async def generate_voice_summary(self):
        try:
            response = await self.client.aio.models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=[
                    types.Part.from_bytes(data=self.bytes, mime_type="application/pdf"),
                    VOICE_PROMPT,
                ],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": InVoiceSummary,
                },
            )
            res = json.loads(response.text)

            logger.info("Summary received from Gemini. Forwarding to Polly.")

            summary = res["summary"]
            title = res["title"]

            audio = self.voice.synthesize_speech(
                Engine="standard",
                LanguageCode="en-US",
                Text=summary,
                OutputFormat="mp3",
                VoiceId="Joanna",
            )

            logger.info("Audio generated.")

            return audio, title

        except Exception as e:
            self.logger.error(f"Error generating voice summary: {str(e)}")
            raise

        except Exception as e:
            self.logger.error(f"Audio generation failed: {str(e)}")
            raise
