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
RUN curl -sSL https://install.python-poetry.org | python3 - && \
    ln -s /root/.local/bin/poetry /usr/local/bin/poetry


COPY pyproject.toml poetry.lock ./


RUN poetry config virtualenvs.create false \
    && poetry install --no-root --no-interaction --no-ansi


COPY . .

ENV PYTHONPATH=/app

# Запуск gunicorn
CMD ["gunicorn", "-c", "gunicorn.config.py", "wsgi:app"]
