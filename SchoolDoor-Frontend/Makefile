# Makefile for SchoolDoor Next.js frontend

# Default target
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  dev           - Run Next.js in Docker (dev, hot reload)"
	@echo "  dev-d         - Run Next.js in Docker (dev, detached)"
	@echo "  stop          - Stop dev containers"
	@echo "  logs          - Tail dev logs"
	@echo "  prod          - Run Next.js in Docker (prod, detached)"
	@echo "  prod-down     - Stop prod containers"
	@echo "  build-image   - Build production image"
	@echo "  start-local   - Run Next.js locally (npm run dev)"
	@echo "  install       - npm ci"

# Docker Compose (Dev)
.PHONY: dev
dev:
	docker compose -f docker-compose.dev.yml up --build

.PHONY: dev-d
dev-d:
	docker compose -f docker-compose.dev.yml up --build -d

.PHONY: stop
stop:
	docker compose -f docker-compose.dev.yml down

.PHONY: logs
logs:
	docker compose -f docker-compose.dev.yml logs -f

# Docker Compose (Prod)
.PHONY: prod
prod:
	@if [ ! -f .env.prod ]; then \
		echo "WARNING: .env.prod file not found. Chatbot will not work without ALFRED_CHAT_API_KEY."; \
		echo "Create .env.prod with: ALFRED_CHAT_API_KEY=your_key_here"; \
	fi
	docker compose -f docker-compose.prod.yml up --build -d

.PHONY: prod-down
prod-down:
	docker compose -f docker-compose.prod.yml down

.PHONY: build-image
build-image:
	docker build -t schooldoor-frontend:latest .

# Local development (without Docker)
.PHONY: install
install:
	npm ci --no-audit --no-fund

.PHONY: start-local
start-local: install
	npm run dev
