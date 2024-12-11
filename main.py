from fastapi import FastAPI, File, UploadFile, HTTPException
from size_middleware import LimitFileUploadSizeMiddleware
from models import DensairInput
import logging
import pymupdf
from pymupdf import Document

app = FastAPI()

MAX_FILE_SIZE_MB = 15

app.add_middleware(
    LimitFileUploadSizeMiddleware, max_upload_size_in_megabytes=MAX_FILE_SIZE_MB
)


def calculate_file_size(bytes_data: bytes) -> float:
    """Calculate file size in megabytes."""
    return len(bytes_data) / (1024 * 1024)


@app.post("/")
async def densair(start_page: int, end_page: int, file: UploadFile = File(...)):
    contents: bytes = await file.read()
    size: float = calculate_file_size(contents)

    try:
        page_range = DensairInput(start_page=start_page, end_page=end_page)
    except ValueError as e:
        logging.error(f"Validation Error: {e}")
        raise HTTPException(status_code=422, detail=f"Validation Error: {e}")
    except TypeError as e:
        logging.error(f"Type Error: {e}")
        raise HTTPException(status_code=422, detail=f"Type Error: {e}")

    if size > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File size exceeds the limit of {MAX_FILE_SIZE_MB} MB.",
        )

    doc: Document = pymupdf.open(stream=contents, filetype="pdf")

    total_pages = doc.page_count

    return {"filename": file.filename, "size": round(size, 2), "pages": total_pages}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
