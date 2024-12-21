from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import PageRangeInput, EstimationResult
from extract import extract, count_pages, count_tokens
from config import logger, host, price_per_token

app = FastAPI()


origins = ["http://localhost:3000", host]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/estimate", response_class=EstimationResult)
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

    return EstimationResult(
        tokens=count_tokens(text), price=price_per_token, link="https://example.com"
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

    return {"text": text}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app="main:app", reload=True, host="localhost", port=8000)
