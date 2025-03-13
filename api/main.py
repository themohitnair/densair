import asyncio
from services.extract import summarize
from services.acquire import fetch_arxiv_pdf_bytes
from config import KEY, PROMPT
import json

json_string = summarize(
    KEY, asyncio.run(fetch_arxiv_pdf_bytes("https://arxiv.org/pdf/1706.03762")), PROMPT
)

data = json.loads(json_string)

markdown_content = f"""
# Abstract Summary
{data.get("abs_explanation", "No abstract summary available.")}

# Methodology Summary
{data.get("meth_explanation", "No methodology summary available.")}

# Conclusion Summary
{data.get("conc_explanation", "No conclusion summary available.")}

# Image Summaries
{"".join([f"## {image['image_fig_num']}\n{image['image_summary']}\n" for image in data.get("image_summaries", [])])}

# Key Terms
{"".join([f"- **{term}**\n" for term in data.get("key_terms", [])])}
"""

with open("output.md", "w") as file:
    file.write(markdown_content)
