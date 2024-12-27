from together import Together
from config import SYS_PROMPT, logger, api_key, model
import os


def get_text_summary(content: str) -> str:
    client = Together(api_key=api_key)
    logger.info("Together AI client initialized.")

    try:
        logger.info("Generating summary for content.")
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYS_PROMPT},
                {"role": "user", "content": content.strip()},
            ],
        )

        if (
            hasattr(response, "choices")
            and response.choices
            and hasattr(response.choices[0], "message")
            and hasattr(response.choices[0].message, "content")
        ):
            summary = response.choices[0].message.content.strip()
            return summary

        logger.error("Invalid response structure or empty choices.")
        return "Unable to generate summary."

    except Exception as e:
        logger.error(f"Error during LLM process: {str(e)}")
        return "An error occurred while generating the summary."


def phony_get_text_summary(content: str) -> str:
    summary = ""
    markdown_file_path = os.path.join("output_files", "input.md")

    try:
        with open(markdown_file_path, "r") as md_file:
            summary = md_file.read()
            return summary
    except FileNotFoundError:
        raise Exception(f"The file {markdown_file_path} was not found.")
