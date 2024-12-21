import markdown


def to_html(text: str):
    html = markdown.markdown(
        text, extensions=["fenced_code", "tables", "codehilite", "toc"]
    )
    return html
