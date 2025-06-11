FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PTTHONPATH=/app

CMD ["gunicorn", "-c", "gunicorn.config.py", "wsgi:app"]