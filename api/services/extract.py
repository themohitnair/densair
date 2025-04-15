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


class Extractor:
    def __init__(
        self,
        pdf_bytes: bytes,
        model_name: str = "gemini-2.0-flash-lite",
    ):
        self.bytes = pdf_bytes
        self.model_name = model_name
        self.client = genai.Client(api_key=GEM_KEY)
        self.logger = logging.getLogger(__name__)
        self._polly_client = None
        self._pdf_part = types.Part.from_bytes(
            data=self.bytes, mime_type="application/pdf"
        )
        self.voice = boto3.client(
            "polly",
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name="ap-south-1",
        )

    @property
    def polly_client(self):
        if self._polly_client is None:
            self._polly_client = boto3.client(
                "polly",
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                region_name="ap-south-1",
            )
        return self._polly_client

    async def _generate_content(self, prompt, response_schema):
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=[self._pdf_part, prompt],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": response_schema,
                },
            )
            return response.text

        except Exception as e:
            self.logger.error(f"Error generating content with {prompt[:30]}...: {e}")

    async def sectionwise_explanations(self) -> TermsAndSummaries:
        try:
            response = await self._generate_content(FIRST_PROMPT, TermsAndSummaries)
            self.logger.info("Sectionwise explanations received.")
            return response
        except Exception as e:
            self.logger.error(f"Error in generarting sectionwise explanations: {e}")

    async def figure_summaries(self) -> FigureSummaries:
        try:
            response = await self._generate_content(SECOND_PROMPT, FigureSummaries)
            self.logger.info("Image summaries received.")
            return response
        except Exception as e:
            self.logger.error(f"Error in generating figure summaries: {e}")

    async def overall_explanation(self) -> OverallSummary:
        try:
            response = await self._generate_content(THIRD_PROMPT, OverallSummary)
            self.logger.info("Overall explanation received.")
            return response
        except Exception as e:
            self.logger.error(f"Error in generating overall summary: {e}")

    async def get_all_summaries(self) -> EndResponse:
        try:
            tasks = [
                self.overall_explanation(),
                self.sectionwise_explanations(),
                self.figure_summaries(),
            ]

            results = await asyncio.gather(*tasks, return_exceptions=True)

            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    self.logger.error(f"Task {i} failed: {result}")
                    raise result

            overall_summary, sectionwise_explanations, figure_summaries = results

            self.logger.info("Combined all summaries into JSON.")

            return EndResponse(
                overall_summary=json.loads(overall_summary),
                terms_and_summaries=json.loads(sectionwise_explanations),
                table_and_figure_summaries=json.loads(figure_summaries),
            )
        except Exception as e:
            self.logger.error(f"Error in combining summaries: {e}")

    async def generate_voice_summary(self):
        try:
            response_text = await self._generate_content(VOICE_PROMPT, InVoiceSummary)
            res = json.loads(response_text)

            self.logger.info("Summary received from Gemini. Forwarding to Polly.")

            summary = res["summary"]
            title = res["title"]

            audio = self.voice.synthesize_speech(
                Engine="neural",
                LanguageCode="en-US",
                Text=summary,
                OutputFormat="mp3",
                VoiceId="Joanna",
            )

            self.logger.info("Audio generated.")

            return audio, title

        except Exception as e:
            self.logger.error(f"Error generating voice summary: {str(e)}")
