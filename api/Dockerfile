# 1. Base image
FROM python:3.12-slim

# 2. Environment tweaks
ENV PYTHONUNBUFFERED=1 \
  PYTHONIOENCODING=UTF-8 \
  PIP_NO_CACHE_DIR=1 \
  PIP_DISABLE_PIP_VERSION_CHECK=1

# 3. Working directory
WORKDIR /app

# 4. System deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  gcc g++ make \
  libffi-dev libjpeg-dev zlib1g-dev \
  libpq-dev \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# 5. Non-root user
RUN useradd --create-home appuser
USER appuser

# 6. Python deps
COPY --chown=appuser:appuser requirements.txt .
RUN pip install --upgrade pip \
  && pip install --no-cache-dir -r requirements.txt \
  && pip install --no-cache-dir gunicorn uvicorn

# 7. App code
COPY --chown=appuser:appuser . .

# 8. Expose the port Cloud Run uses
EXPOSE 8080

# 9. Start Gunicorn, binding to $PORT (sh –c expands it)
ENTRYPOINT ["sh","-c"]  
CMD ["exec gunicorn main:app \
  --bind 0.0.0.0:${PORT:-8080} \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --threads 8 \
  --timeout 0"]