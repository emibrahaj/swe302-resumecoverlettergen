FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN python -m playwright install --with-deps chromium

COPY backend ./backend

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
