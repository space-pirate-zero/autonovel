# SPZ Asset MCP — Cloud Run container.
# Build context is the asset-mcp/ directory (see deploy.sh: `--source .`).
FROM python:3.12-slim

# ffmpeg/ffprobe for video keyframe + duration extraction (enrich.py).
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY config.json ./config.json
COPY brand/ ./brand/
COPY app/ ./app/

ENV PYTHONUNBUFFERED=1
# app modules import each other by top-level name; config.json resolves to /app/config.json.
WORKDIR /app/app
CMD ["python", "main.py"]
