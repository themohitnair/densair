import markdown
from bs4 import BeautifulSoup


def to_html(text: str):
    html = markdown.markdown(
        text, extensions=["fenced_code", "tables", "codehilite", "toc"]
    )
    return html
