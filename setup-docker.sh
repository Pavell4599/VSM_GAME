#!/bin/bash
# VSM_GAME Docker Setup Verification Script

echo "🐳 VSM_GAME Docker Setup Verification"
echo "======================================"
echo ""

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

echo "✅ Docker installed: $(docker --version)"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

echo "✅ Docker Compose installed: $(docker-compose --version)"
echo ""

# Build and run
echo "Building images..."
docker compose build

echo ""
echo "Starting services..."
docker compose up -d

echo ""
echo "Waiting for services to be healthy..."
sleep 10

echo ""
echo "🎯 Service Status:"
echo "==================="
docker compose ps

echo ""
echo "📡 API Endpoints:"
echo "=================="
echo "Frontend:  http://localhost:8080"
echo "Backend:   http://localhost:8000"
echo "Admin:     http://localhost:8000/admin"

echo ""
echo "✅ Setup complete!"
echo ""
echo "To stop services: docker compose down"
echo "To view logs:     docker compose logs -f"
