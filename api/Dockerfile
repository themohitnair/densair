# 1. Base image
FROM python:3.12-slim

# 2. Environment tweaks
ENV PYTHONUNBUFFERED=1 \
  PYTHONIOENCODING=UTF-8 \
  PIP_NO_CACHE_DIR=1 \
  PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# 3. System dependencies
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  gcc g++ make \
  libffi-dev libjpeg-dev zlib1g-dev \
  libpq-dev \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# 4. Install Python deps *as root* so uvicorn lands in /usr/local/bin
COPY requirements.txt .
RUN pip install --upgrade pip \
  && pip install --no-cache-dir -r requirements.txt \
  && pip install --no-cache-dir uvicorn

# 5. Create and switch to a non-root user
RUN useradd --create-home appuser
USER appuser

# 6. Copy application code
COPY --chown=appuser:appuser . .

# 7. Informational only: Cloud Run injects $PORT (default 8080)
EXPOSE 8080

# 8. Shell-form CMD so $PORT is evaluated at container start
CMD exec uvicorn main:app \
  --host 0.0.0.0 \
  --port ${PORT:-8080} \
  --workers 4 \
  --proxy-headers
