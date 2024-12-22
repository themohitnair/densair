import textwrap
import logging
import os
from dotenv import load_dotenv

load_dotenv()
host = os.getenv("HOST_VERCEL")
price_per_token = float(os.getenv("PRICE_PER_TOKEN"))
api_key = os.getenv("TOGETHER_API_KEY")
model = os.getenv("MODEL_NAME")

logging.basicConfig(
    level=logging.INFO,
    format="[ %(levelname)s ]: (%(asctime)s) - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)

logger.info("Logger setup completed!")

SYS_PROMPT = textwrap.dedent("""
    You are an AI trained to summarize textbooks into detailed PowerPoint-style slides. Instructions: 1. Break large text into concise, detailed bullet points under headings/subheadings. 2. Use multiple slides for the same heading/subheading if needed; do not truncate key info. 3. Include examples, explanations, and context for academic quality and clarity. 4. Distribute content proportionally across slides by depth and importance. 5. Maintain heading-subheading hierarchy across slides. 6. Wrap each slide with '<!-- Slide Start -->' and '<!-- Slide End -->'. 7. Ensure slides are self-contained, paraphrased, and presentation-ready. 8. Prioritize comprehension over brevity; do not omit examples or elaborations to shorten slides. 9. Enclose code in triple backticks. 10. The first slide should only contain the title. 11. Use '##' for slide headings, '#' only for the presentation title, and lower levels for subheadings. 12. Use **bold** and *italics* for emphasis derived from the content.
""")
