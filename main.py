from fastapi import FastAPI, File, UploadFile, HTTPException
from size_middleware import LimitFileUploadSizeMiddleware

app = FastAPI()

MAX_FILE_SIZE_MB = 15


app.add_middleware(
    LimitFileUploadSizeMiddleware, max_upload_size_in_megabytes=MAX_FILE_SIZE_MB
)


@app.post("/")
async def densair(file: UploadFile = File(...)):
    contents: bytes = await file.read()
    size = len(contents) / (1024 * 1024)
    if size > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File size exceeds the limit of {MAX_FILE_SIZE_MB} MB.",
        )
    return {"filename": file.filename, "size_in_mb": round(size, 2)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
