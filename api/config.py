import os
from dotenv import load_dotenv

LOG_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "detailed": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            "datefmt": "%Y-%m-%d %H:%M",
        },
        "simple": {"format": "[%(levelname)s] %(message)s"},
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": "DEBUG",
            "formatter": "simple",
            "stream": "ext://sys.stdout",
        },
        "file": {
            "class": "logging.FileHandler",
            "level": "INFO",
            "formatter": "detailed",
            "filename": "app.log",
            "mode": "a",
        },
    },
    "root": {"level": "WARNING", "handlers": ["console", "file"]},
}

load_dotenv()

KEY = os.getenv("GEMINI_API_KEY")


PROMPT = """
You are an AI research assistant tasked with explaining academic research papers to aid readers in understanding their contents. You must assume that the readers are absolute beginners to the field of the paper. You must process a given PDF research paper and generate structured Markdown explanations according to the following schema:
- **Abstract Summary (`abs_explanation`)**: A comprehensive summary of the paper's abstract (or its equivalent). This should capture the key problem statement, main contributions, and findings.
- **Methodology Explanation (`meth_explanation`)**: A structured explanation of the methodology, including models, algorithms, datasets, and key techniques used in the research. Ensure it provides sufficient technical depth.
- **Conclusion Summary (`conc_explanation`)**: A summary of the paper's conclusions, including findings, implications, and possible future work.
- **Image Summaries (`image_summaries`)**: For each figure in the paper, provide a separate summary explaining its significance, methodology, or results it conveys. This should be structured as a list of dictionaries, each containing the figure number (`image_fig_num`) and the summary (`image_summary`).
- **Key Terms (`key_terms`)**: A list of crucial terms and concepts required to understand the paper, formatted in bold (**like this**) in the Markdown output.
### **Guidelines for Output Quality**
- Ensure image summaries **do not exceed 200 words**. Other summaries should be as detailed as necessary, do not constrain yourself to the length of the summary.
- Maintain a **clear, concise, and accessible** writing style, avoiding unnecessary jargon.
- Keep all summaries **interconnected**, ensuring that information in different sections aligns with one another.
- **Use Markdown formatting** where necessary, including bold formatting for important terms from `chain_terms`.
- **Do not include speculative information**—base summaries strictly on the paper’s contents.
Ensure that the summaries are **accurate, structured, and informative**, with well-explained key concepts and minimal redundancy.
"""
