#!/bin/bash

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found"
    exit 1
fi

# Check if MTA API key is set
if ! grep -q "MTA_API_KEY" .env; then
    echo "Error: MTA_API_KEY not found in .env file"
    exit 1
fi

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Build and start containers
echo "Stopping existing containers..."
docker compose down

echo "Building containers..."
docker compose build

echo "Starting containers..."
docker compose up -d

# Wait for services to be healthy
echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
if ! docker compose ps --format json | grep -q "\"State\":\"running\""; then
    echo "Error: Some containers failed to start"
    docker compose logs
    exit 1
fi

# Check backend health
echo "Checking backend health..."
if ! curl -s http://localhost:8000/api/health > /dev/null; then
    echo "Error: Backend health check failed"
    docker compose logs backend
    exit 1
fi

# Check frontend
echo "Checking frontend..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "Error: Frontend not responding"
    docker compose logs frontend
    exit 1
fi

echo "Deployment successful! Services are running:"
docker compose ps

echo "
Application URLs:
Frontend: http://localhost:3000
Backend API: http://localhost:8000"
