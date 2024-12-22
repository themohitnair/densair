import markdown
import re


def to_html(text: str) -> str:
    html = markdown.markdown(
        text, extensions=["fenced_code", "tables", "codehilite", "toc"]
    )
    return html


def to_slides(html: str) -> list[str]:
    slides: list[str] = re.findall(
        r"<!-- Slide Start -->(.*?)<!-- Slide End -->", html, re.DOTALL
    )
    for slide in slides:
        slide = slide.strip()
    return slides
