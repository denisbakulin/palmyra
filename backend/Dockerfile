FROM python:3.11-slim

WORKDIR /app

# Устанавливаем зависимости для Poetry и сборки
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*


ENV POETRY_VERSION=1.8.2
RUN pip install --no-cache-dir poetry \
 && poetry config virtualenvs.create false


COPY pyproject.toml poetry.lock ./


RUN poetry config virtualenvs.create false \
    && poetry install --no-root --no-interaction --no-ansi

COPY . .

ENV PYTHONPATH=/app

CMD ["gunicorn", "-c", "gunicorn.config.py", "wsgi:app"]
