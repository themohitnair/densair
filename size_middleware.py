from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from fastapi import FastAPI, HTTPException
import logging

logging.basicConfig(level=logging.INFO)


class LimitFileUploadSizeMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: FastAPI, max_upload_size_in_megabytes: float):
        super().__init__(app)
        self.max_upload_size_mb = max_upload_size_in_megabytes

    async def dispatch(self, request: Request, call_next: callable):
        if request.method == "POST":
            content_length = request.headers.get("content-length")
            if not content_length:
                logging.error("Missing Content-Length header in request.")
                raise HTTPException(
                    status_code=411,
                    detail="Content-Length header is required for file uploads.",
                )

            try:
                content_length = int(content_length)
            except ValueError:
                logging.error("Invalid Content-Length header value.")
                raise HTTPException(
                    status_code=400,
                    detail="Content-Length header must be a valid integer.",
                )

            if not content_length <= (self.max_upload_size_mb * 1024 * 1024):
                logging.error(
                    f"File size exceeds limit: {content_length} bytes (Limit: {self.max_upload_size_mb} megabytes)."
                )
                raise HTTPException(
                    status_code=413,
                    detail=f"File size exceeds the limit of {self.max_upload_size_mb} MB.",
                )

        return await call_next(request)
