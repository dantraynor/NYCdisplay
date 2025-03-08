#!/bin/bash

# Pull latest changes
git pull origin main

# Build and start containers
docker compose down
docker compose build
docker compose up -d

# Show container status
docker compose ps
