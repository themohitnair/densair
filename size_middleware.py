from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from fastapi import FastAPI, HTTPException


class LimitFileUploadSizeMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: FastAPI, max_upload_size_in_megabytes: float):
        super().__init__(app)
        self.max_upload_size = max_upload_size_in_megabytes * 1024 * 1024

    async def dispatch(self, request: Request, call_next: callable):
        if request.method in {"POST", "PUT"}:
            content_type = request.headers.get("content-type")
            if not content_type or "application/pdf" not in content_type:
                raise HTTPException(
                    status_code=415,
                    detail="Only PDF files are allowed.",
                )

            content_length = request.headers.get("content-length")
            if not content_length:
                raise HTTPException(
                    status_code=411,
                    detail="Content-Length header is required for file uploads.",
                )

            if int(content_length) > self.max_upload_size:
                raise HTTPException(
                    status_code=413,
                    detail=f"File size exceeds limit of {self.max_upload_size} bytes.",
                )

        return await call_next(request)
