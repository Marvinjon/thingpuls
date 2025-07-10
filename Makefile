# Politico Web Application Makefile

.PHONY: help dev prod stop logs status clean build test migrate createsuperuser backup restore

# Default target
help:
	@echo "Politico Web Application - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev              # Start development environment"
	@echo "  make dev-no-nginx     # Start development without nginx"
	@echo ""
	@echo "Production:"
	@echo "  make prod             # Start production environment"
	@echo "  make prod-build       # Build and start production"
	@echo ""
	@echo "Management:"
	@echo "  make stop             # Stop all services"
	@echo "  make logs [SERVICE]   # Show logs (e.g., make logs backend)"
	@echo "  make status           # Show service status"
	@echo "  make clean            # Clean up containers and volumes"
	@echo ""
	@echo "Database:"
	@echo "  make migrate          # Run Django migrations"
	@echo "  make createsuperuser  # Create Django superuser"
	@echo "  make backup           # Create database backup"
	@echo "  make restore          # Restore database from backup"
	@echo ""
	@echo "Build:"
	@echo "  make build            # Build all images"
	@echo "  make build-no-cache   # Build without cache"
	@echo ""
	@echo "Testing:"
	@echo "  make test             # Run Django tests"
	@echo "  make test-frontend    # Run frontend tests"

# Development
dev:
	@echo "Starting development environment..."
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up

dev-no-nginx:
	@echo "Starting development environment without nginx..."
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile nginx up

# Production
prod:
	@echo "Starting production environment..."
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

prod-build:
	@echo "Building and starting production environment..."
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Management
stop:
	@echo "Stopping all services..."
	docker compose down

logs:
	@docker compose logs -f $(SERVICE)

status:
	@echo "Service status:"
	@docker compose ps

clean:
	@echo "Cleaning up containers and volumes..."
	docker compose down -v
	docker system prune -f

# Database operations
migrate:
	@echo "Running Django migrations..."
	docker compose exec backend python manage.py migrate

createsuperuser:
	@echo "Creating Django superuser..."
	docker compose exec backend python manage.py createsuperuser

backup:
	@echo "Creating database backup..."
	docker compose exec db pg_dump -U politico_user politico_db > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup created: backup_$(shell date +%Y%m%d_%H%M%S).sql"

restore:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make restore FILE=backup_file.sql"; \
		exit 1; \
	fi
	@echo "Restoring database from $(FILE)..."
	docker compose exec -T db psql -U politico_user politico_db < $(FILE)

# Build operations
build:
	@echo "Building all images..."
	docker compose build

build-no-cache:
	@echo "Building all images without cache..."
	docker compose build --no-cache

# Testing
test:
	@echo "Running Django tests..."
	docker compose exec backend python manage.py test

test-frontend:
	@echo "Running frontend tests..."
	docker compose exec frontend npm test

# Quick setup
setup:
	@echo "Setting up the application..."
	@if [ ! -f .env ]; then \
		echo "Creating .env file from template..."; \
		cp env.example .env; \
		echo "Please edit .env file with your settings."; \
	else \
		echo ".env file already exists."; \
	fi
	@echo "Building images..."
	docker compose build
	@echo "Setup complete! Run 'make dev' to start development."

# Show URLs
urls:
	@echo "Development URLs:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  Admin:    http://localhost:8000/admin"
	@echo ""
	@echo "Production URLs:"
	@echo "  Application: http://localhost"
	@echo "  API:        http://localhost/api/v1/"
	@echo "  Admin:      http://localhost/admin" 