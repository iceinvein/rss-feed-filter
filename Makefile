.PHONY: help build up down restart logs shell clean test

# Default target
help:
	@echo "RSS Feed Filter - Docker Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make build    - Build the Docker image"
	@echo "  make up       - Start the application"
	@echo "  make down     - Stop the application"
	@echo "  make restart  - Restart the application"
	@echo "  make logs     - View application logs"
	@echo "  make shell    - Access container shell"
	@echo "  make clean    - Remove containers and images"
	@echo "  make test     - Test the Docker build"
	@echo ""

# Build the Docker image
build:
	@echo "🐳 Building Docker image..."
	docker-compose build

# Start the application
up:
	@echo "🚀 Starting application..."
	docker-compose up -d
	@echo "✅ Application started at http://localhost:3000"

# Stop the application
down:
	@echo "🛑 Stopping application..."
	docker-compose down

# Restart the application
restart:
	@echo "🔄 Restarting application..."
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

# Access container shell
shell:
	docker-compose exec rss-feed-filter sh

# Clean up containers and images
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down -v
	docker rmi rss-feed-filter:latest || true
	@echo "✅ Cleanup complete"

# Test the build
test:
	@echo "🧪 Testing Docker build..."
	docker-compose build
	docker-compose up -d
	@sleep 5
	@echo "Testing health endpoint..."
	@curl -f http://localhost:3000/api/onboarding || (docker-compose logs && exit 1)
	@echo "✅ Build test passed"
	docker-compose down

# Development commands
dev:
	bun run dev

lint:
	npm run lint

build-local:
	bun run build

