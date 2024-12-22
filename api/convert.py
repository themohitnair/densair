import markdown
import re
from bs4 import BeautifulSoup
from pptx import Presentation
import os


def to_html(text: str) -> str:
    html = markdown.markdown(
        text, extensions=["fenced_code", "tables", "codehilite", "toc"]
    )

    output_dir = "output_files"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    markdown_file_path = os.path.join(output_dir, "input.md")
    with open(markdown_file_path, "w") as md_file:
        md_file.write(text)

    html_file_path = os.path.join(output_dir, "output.html")
    with open(html_file_path, "w") as html_file:
        html_file.write(html)

    return html


def to_html_pieces(html: str) -> list[str]:
    pieces: list[str] = re.findall(
        r"<!-- Slide Start -->(.*?)<!-- Slide End -->", html, re.DOTALL
    )
    for piece in pieces:
        piece = piece.strip()
    return pieces


def to_presentation(markdown_input: str) -> Presentation:
    html = to_html(markdown_input)
    html_pieces = to_html_pieces(html)
    presentation = Presentation()

    for html in html_pieces:
        soup = BeautifulSoup(html, "html.parser")

        title = soup.find("h2").text if soup.find("h2") else None
        bullet_points = [li.text.strip() for li in soup.find_all("li")]

        if title:
            slide_layout = presentation.slide_layouts[1]
        else:
            slide_layout = presentation.slide_layouts[5]

        slide = presentation.slides.add_slide(slide_layout)

        if title:
            slide.shapes.title.text = title

        content_placeholder = slide.placeholders[1] if title else slide.shapes[0]

        for point in bullet_points:
            paragraph = content_placeholder.text_frame.add_paragraph()
            paragraph.text = point

    return presentation
