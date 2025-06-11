.PHONY: build up down restart logs bash backend frontend db

COMPOSE=docker compose
BAKE=COMPOSE_BAKE=true $(COMPOSE)

# Сборка всех контейнеров с bake
build:
	$(BAKE) build

# Запуск контейнеров
up:
	$(BAKE) up -d

# Остановка контейнеров
down:
	$(COMPOSE) down

# Перезапуск
restart:
	$(COMPOSE) restart --build

# Логи всех сервисов
logs:
	$(COMPOSE) logs -f

# Bash внутри контейнера backend
backend:
	$(COMPOSE) exec backend bash

# Bash внутри контейнера frontend
frontend:
	$(COMPOSE) exec frontend sh

# Bash в контейнере базы данных
db:
	$(COMPOSE) exec db bash
