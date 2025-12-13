# SchoolDoor Makefile
# Development and Production Build Management

.PHONY: help dev prod dev-build prod-build dev-up prod-up dev-down prod-down dev-logs prod-logs dev-shell prod-shell dev-init prod-init dev-test prod-test clean

# Default target
help:
	@echo "SchoolDoor Development & Production Management"
	@echo "=============================================="
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-build    - Build development Docker image"
	@echo "  make dev-up       - Start development containers"
	@echo "  make dev-down     - Stop development containers"
	@echo "  make dev-logs     - View development logs"
	@echo "  make dev-shell    - Access development container shell"
	@echo "  make dev-init     - Initialize development database"
	@echo "  make dev-test     - Run development tests"
	@echo ""
	@echo "Production Commands:"
	@echo "  make prod         - Start production environment"
	@echo "  make prod-build   - Build production Docker image"
	@echo "  make prod-up      - Start production containers"
	@echo "  make prod-down    - Stop production containers"
	@echo "  make prod-logs    - View production logs"
	@echo "  make prod-shell   - Access production container shell"
	@echo "  make prod-init    - Initialize production database"
	@echo "  make prod-test    - Run production tests"
	@echo ""
	@echo "Database Commands:"
	@echo "  make migrate      - Run database migrations"
	@echo "  make migrate-status - Check migration status"
	@echo "  make migrate-create - Create new migration"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make clean        - Clean up Docker images and containers"
	@echo "  make help         - Show this help message"

# Development Environment
dev: dev-build dev-up dev-init
	@echo "✅ Development environment started!"
	@echo "🌐 Admin Panel: http://localhost:3000"
	@echo "📚 API Docs: http://localhost:6001/docs"

dev-build:
	@echo "🔨 Building development Docker image..."
	docker-compose -f docker-compose.dev.yml build

dev-up:
	@echo "🚀 Starting development containers..."
	docker-compose -f docker-compose.dev.yml up -d

dev-down:
	@echo "🛑 Stopping development containers..."
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	@echo "📋 Viewing development logs..."
	docker-compose -f docker-compose.dev.yml logs -f api

dev-shell:
	@echo "🐚 Accessing development container shell..."
	docker-compose -f docker-compose.dev.yml exec api bash

dev-init:
	@echo "🗄️ Initializing development database..."
	docker-compose -f docker-compose.dev.yml exec api python init_db.py

dev-test:
	@echo "🧪 Running development tests..."
	docker-compose -f docker-compose.dev.yml exec api python -m pytest

# Production Environment
prod: prod-build prod-up prod-init
	@echo "✅ Production environment started!"
	@echo "🌐 Admin Panel: https://admin.schooldoor.in"
	@echo "📚 API Docs: https://admin.schooldoor.in/docs"

prod-build:
	@echo "🔨 Building production Docker image..."
	docker-compose -f docker-compose.prod.yml build

prod-up:
	@echo "🚀 Starting production containers..."
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	@echo "🛑 Stopping production containers..."
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	@echo "📋 Viewing production logs..."
	docker-compose -f docker-compose.prod.yml logs -f api

prod-shell:
	@echo "🐚 Accessing production container shell..."
	docker-compose -f docker-compose.prod.yml exec api bash

prod-init:
	@echo "🗄️ Initializing production database..."
	docker-compose -f docker-compose.prod.yml exec api python init_db.py

prod-test:
	@echo "🧪 Running production tests..."
	docker-compose -f docker-compose.prod.yml exec api python -m pytest

# Database Commands
migrate:
	@echo "🗄️ Running database migrations..."
	docker-compose -f docker-compose.dev.yml exec api alembic upgrade head

migrate-status:
	@echo "📊 Checking migration status..."
	docker-compose -f docker-compose.dev.yml exec api alembic current

migrate-create:
	@echo "📝 Creating new migration..."
	@read -p "Enter migration message: " msg; \
	docker-compose -f docker-compose.dev.yml exec api alembic revision --autogenerate -m "$$msg"

# Utility Commands
clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose -f docker-compose.dev.yml down --volumes --remove-orphans
	docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans
	docker system prune -f
	docker image prune -f

# Quick Commands
start: dev
stop: dev-down
restart: dev-down dev-up
status:
	@echo "📊 Development Status:"
	@docker-compose -f docker-compose.dev.yml ps
	@echo ""
	@echo "📊 Production Status:"
	@docker-compose -f docker-compose.prod.yml ps
