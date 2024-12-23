import markdown
import re
from bs4 import BeautifulSoup
from pptx import Presentation
import os
from pptx.util import Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor


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
    pieces = [piece.strip() for piece in pieces]
    return pieces


def to_presentation(markdown_input: str) -> Presentation:
    html = to_html(markdown_input)
    html_pieces = to_html_pieces(html)
    presentation = Presentation()

    for index, html_piece in enumerate(html_pieces):
        soup = BeautifulSoup(html_piece, "html.parser")

        if index == 0:
            title = soup.find("h1").text if soup.find("h1") else None
            slide_layout = presentation.slide_layouts[0]
            slide = presentation.slides.add_slide(slide_layout)

            if title:
                title_shape = slide.shapes.title
                title_shape.text = title

                title_shape.text_frame.paragraphs[0].font.size = Pt(48)
                title_shape.text_frame.paragraphs[0].font.color.rgb = RGBColor(
                    0, 0, 139
                )
                title_shape.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

        else:
            title = soup.find("h2").text if soup.find("h2") else None
            bullet_points = [li.text.strip() for li in soup.find_all("li")]

            slide_layout = (
                presentation.slide_layouts[1]
                if title
                else presentation.slide_layouts[5]
            )
            slide = presentation.slides.add_slide(slide_layout)

            if title:
                title_shape = slide.shapes.title
                title_shape.text = title
                title_shape.text_frame.paragraphs[0].alignment = PP_ALIGN.LEFT

                title_shape.text_frame.paragraphs[0].font.size = Pt(36)
                title_shape.text_frame.paragraphs[0].font.color.rgb = RGBColor(
                    255, 0, 0
                )

            content_placeholder = slide.placeholders[1] if title else slide.shapes[0]

            for point in bullet_points:
                paragraph = content_placeholder.text_frame.add_paragraph()
                paragraph.text = point

                paragraph.font.size = Pt(18)
                paragraph.font.color.rgb = RGBColor(0, 0, 0)
                paragraph.alignment = PP_ALIGN.LEFT
                paragraph.space_after = Pt(6)

    return presentation
