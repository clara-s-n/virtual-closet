#!/bin/bash

# Virtual Closet Stop Script

echo "Stopping Virtual Closet Application..."

# Stop and remove containers
docker compose down

echo ""
echo "Virtual Closet has been stopped."
echo ""
echo "To remove all data (including database and images), run:"
echo "  docker compose down -v"
echo ""
