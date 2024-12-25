from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from models import PageRangeInput, EstimationResult
from extract import extract, count_pages, count_tokens, estimate_price
from config import logger, host, price_per_token, live_key_id_rzp, live_key_secret_rzp
from condense import get_text_summary
from convert import to_presentation
from payment import create_payment_link
import tempfile
import uuid

app = FastAPI()


origins = ["http://localhost:3000", host]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/estimate")
async def estimate(
    file: UploadFile = File(...), start_page: int = Form(...), end_page: int = Form(...)
):
    logger.info("Reading PDF File.")
    content = await file.read()
    logger.info("PDF File read!")

    num_pages = await count_pages(content)
    try:
        page_range = PageRangeInput(
            start_page=start_page, end_page=end_page, num_pages=num_pages
        )
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    logger.info("Input validated.")

    text = await extract(content, page_range)

    token_count = await count_tokens(text.strip())
    price = await estimate_price(token_count, price_per_token)

    return EstimationResult(
        tokens=token_count,
        price=price,
        payment_link=create_payment_link(
            live_key_id_rzp,
            live_key_secret_rzp,
            price,
            "Densair PDF to PPT condensation",
        ),
    )


@app.post("/convert")
async def convert(
    file: UploadFile = File(...), start_page: int = Form(...), end_page: int = Form(...)
):
    logger.info("Reading PDF File.")
    content = await file.read()
    logger.info("PDF File read!")

    num_pages = await count_pages(content)
    try:
        page_range = PageRangeInput(
            start_page=start_page, end_page=end_page, num_pages=num_pages
        )
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    logger.info("Input validated.")

    text = await extract(content, page_range)
    summary = get_text_summary(text.strip())

    presentation = to_presentation(summary)

    filename = f"{uuid.uuid4()}.pptx"

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pptx") as temp_file:
        temp_file_path = temp_file.name
        presentation.save(temp_file_path)

    return FileResponse(
        temp_file_path,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        filename=filename,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app="main:app", reload=True, host="localhost", port=8000)
