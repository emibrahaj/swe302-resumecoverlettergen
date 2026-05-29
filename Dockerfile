# Production image for the FastAPI backend (the service deployed on Fly).
#
# Why this base image: the PDF feature renders HTML to PDF with Playwright, which
# needs a real Chromium browser + its system libraries. A plain `python:*` image
# (or Fly's default Nixpacks build) installs the `playwright` PIP package but NOT
# the browser binary, so Chromium can't launch in production — that's why the web
# PDF download failed (Playwright threw, the code fell back to the Jinja renderer,
# and that couldn't produce a PDF without a browser either).
#
# Playwright's official Python image ships Chromium and every system dependency it
# needs, so the renderer works in production. Pin the tag to the playwright version
# in requirements.txt.
FROM mcr.microsoft.com/playwright/python:v1.58.0-jammy

WORKDIR /app

# Install Python deps first for better layer caching, then make sure the Chromium
# build that matches the pip-installed Playwright is present.
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt \
    && python -m playwright install chromium

# Backend source only (includes backend/templates used by the Jinja PDF fallback).
# Secrets (SUPABASE_*, GROQ_API_KEY, FRONTEND_BASE_URL, ...) come from Fly env vars,
# never baked into the image — see .dockerignore which excludes .env.
COPY backend ./backend

ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Fly routes external traffic to [http_service].internal_port from your fly.toml.
# This listens on $PORT (default 8080, Fly's default). IMPORTANT: make sure your
# fly.toml internal_port matches this (8080) or set a PORT env var, otherwise the
# app will be unreachable after deploy.
EXPOSE 8080
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
