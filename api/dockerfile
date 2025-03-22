FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
  PYTHONIOENCODING=UTF-8 \
  PIP_NO_CACHE_DIR=1 \
  PIP_DISABLE_PIP_VERSION_CHECK=1 \
  POETRY_VIRTUALENVS_CREATE=false

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
  gcc g++ make \
  libffi-dev libjpeg-dev zlib1g-dev \
  libpq-dev && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home appuser
USER appuser

COPY --chown=appuser:appuser requirements.txt .

RUN pip install --upgrade pip && \
  pip install --no-cache-dir uvicorn && \
  pip install --no-cache-dir torch==2.6.0 --index-url https://download.pytorch.org/whl/cpu && \
  pip install --no-cache-dir -r requirements.txt

RUN pip install uvicorn

COPY --chown=appuser:appuser . .

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
