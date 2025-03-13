from google import genai
from google.genai import types
from models import Response


def summarize(api_key: str, pdf_bytes: bytes, prompt: str) -> str:
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-1.5-pro",
        contents=[
            types.Part.from_bytes(
                data=pdf_bytes,
                mime_type="application/pdf",
            ),
            prompt,
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": Response,
        },
    )
    return response.text
