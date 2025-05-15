# Use a slim Python 3.12 base image
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
  PYTHONIOENCODING=UTF-8 \
  PIP_NO_CACHE_DIR=1 \
  PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
  gcc g++ make \
  libffi-dev libjpeg-dev zlib1g-dev \
  libpq-dev \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home appuser
USER appuser

COPY --chown=appuser:appuser requirements.txt .
RUN pip install --upgrade pip \
  && pip install --no-cache-dir -r requirements.txt

RUN pip install --no-cache-dir gunicorn uvicorn

COPY --chown=appuser:appuser . .

EXPOSE 8000

ENTRYPOINT exec gunicorn main:app \
  --bind :$PORT \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --threads 8 \
  --timeout 0
