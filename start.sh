#!/bin/bash

# Virtual Closet Startup Script

echo "Starting Virtual Closet Application..."
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Start services
echo "Building and starting all services..."
docker compose up -d

echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check service status
echo ""
echo "Service Status:"
echo "==============="
docker compose ps

echo ""
echo "======================================"
echo "Virtual Closet is starting up!"
echo "======================================"
echo ""
echo "Please wait a few moments for all services to initialize."
echo ""
echo "Application URLs:"
echo "  - Frontend:        http://localhost:5173"
echo "  - Backend API:     http://localhost:3000"
echo "  - API Docs:        http://localhost:3000/docs"
echo "  - MinIO Console:   http://localhost:9001 (minioadmin/minioadmin)"
echo ""
echo "To view logs:"
echo "  docker compose logs -f"
echo ""
echo "To stop the application:"
echo "  docker compose down"
echo ""
echo "To stop and remove all data:"
echo "  docker compose down -v"
echo ""
