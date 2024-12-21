from together import Together
from config import SYS_PROMPT, logger, api_key, model


def get_text_summary(content: str):
    client = Together(api_key=api_key)
    logger.info("Together AI client loaded with API key.")

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYS_PROMPT},
                {"role": "user", "content": content},
            ],
        )
        return response.choices[0].message.content

    except Exception as e:
        logger.error("Error occurred in LLM process.")
        return f"An error occurred: {str(e)}"
