#!/bin/bash

# Validation script for Virtual Closet application

echo "Virtual Closet - Pre-deployment Validation"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker
echo -n "Checking Docker... "
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker is installed"
else
    echo -e "${RED}✗${NC} Docker is not installed"
    exit 1
fi

# Check Docker Compose
echo -n "Checking Docker Compose... "
if docker compose version &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose is available"
else
    echo -e "${RED}✗${NC} Docker Compose is not available"
    exit 1
fi

# Validate Docker Compose configuration
echo -n "Validating docker-compose.yml... "
if docker compose config > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Configuration is valid"
else
    echo -e "${RED}✗${NC} Configuration has errors"
    exit 1
fi

# Check required files
echo ""
echo "Checking required files:"

files=(
    "docker-compose.yml"
    "backend/package.json"
    "backend/tsconfig.json"
    "backend/Dockerfile"
    "backend/prisma/schema.prisma"
    "frontend/package.json"
    "frontend/tsconfig.json"
    "frontend/Dockerfile"
    "frontend/vite.config.ts"
    "ai-service/app.py"
    "ai-service/requirements.txt"
    "ai-service/Dockerfile"
)

all_files_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file (missing)"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    echo ""
    echo -e "${RED}Some required files are missing!${NC}"
    exit 1
fi

# Validate Python syntax
echo ""
echo -n "Validating Python code... "
if python3 -m py_compile ai-service/app.py 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Python syntax is valid"
else
    echo -e "${RED}✗${NC} Python syntax errors"
    exit 1
fi

# Check ports availability
echo ""
echo "Checking port availability:"

check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "  ${YELLOW}⚠${NC} Port $port ($service) is already in use"
        return 1
    else
        echo -e "  ${GREEN}✓${NC} Port $port ($service) is available"
        return 0
    fi
}

all_ports_available=true
check_port 3000 "Backend" || all_ports_available=false
check_port 5173 "Frontend" || all_ports_available=false
check_port 5432 "PostgreSQL" || all_ports_available=false
check_port 9000 "MinIO" || all_ports_available=false
check_port 9001 "MinIO Console" || all_ports_available=false
check_port 5000 "AI Service" || all_ports_available=false

if [ "$all_ports_available" = false ]; then
    echo ""
    echo -e "${YELLOW}Warning: Some ports are in use. You may need to stop other services.${NC}"
fi

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}Validation Complete!${NC}"
echo ""
echo "The application structure is ready for deployment."
echo ""
echo "Next steps:"
echo "  1. Run: ./start.sh"
echo "  2. Wait for services to initialize (~30 seconds)"
echo "  3. Access http://localhost:5173"
echo ""
echo "For detailed instructions, see README.md"
echo "=========================================="
