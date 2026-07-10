FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps for psycopg + building wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install the CPU-only torch FIRST (no CUDA) so sentence-transformers doesn't
# pull the ~2GB GPU build. Keeps the image far smaller — important for Render.
RUN pip install --upgrade pip \
 && pip install --retries 5 --timeout 300 \
    --index-url https://download.pytorch.org/whl/cpu torch==2.5.1

COPY requirements.txt .
# --retries/--timeout guard against transient PyPI network blips.
RUN pip install --retries 5 --timeout 300 -r requirements.txt

# Pre-download the multilingual embedding model at BUILD time so the container
# never stalls (or times out / OOMs) fetching ~470MB on its first request.
RUN python -c "from sentence_transformers import SentenceTransformer; \
SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')"

COPY app ./app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
