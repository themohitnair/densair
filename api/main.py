from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from models import PDFInput
from extract import extract
from config import logger

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://densair.vercel.app",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def greet():
    return {"message": "densair greets ya!"}


@app.post("/convert")
async def convert(
    file: UploadFile = File(...), start_page: int = Form(...), end_page: int = Form(...)
):
    input = PDFInput(pdf_file=file, start_page=start_page, end_page=end_page)
    logger.info("Input validated.")
    text = extract(input)
    return {"text": text}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app="main:app", reload=True, host="localhost", port=8000)
