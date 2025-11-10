#!/bin/bash

# RSS Feed Filter - Docker Build Script
# This script builds the Docker image for the application

set -e

echo "🐳 Building RSS Feed Filter Docker image..."

# Build the image
docker build -t rss-feed-filter:latest .

echo "✅ Docker image built successfully!"
echo ""
echo "To run the container:"
echo "  docker-compose up -d"
echo ""
echo "Or run manually:"
echo "  docker run -d -p 3000:3000 -v \$(pwd)/data:/app/data rss-feed-filter:latest"

