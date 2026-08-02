#!/usr/bin/env bash

# ==============================================================================
# Direct Deployment Script for TeleARGlass (Bash)
# (Docker Container + Local Reverse Proxy on Port 3000)
# ==============================================================================
# Usage: ./deploy.sh
# Make executable first: chmod +x deploy.sh
# ==============================================================================

set -e # Exit script on any command failure

APP_NAME="telearglass"
PORT="3000"
ENV_FILE=".env"

echo "----------------------------------------------------"
echo "Starting Automated Deployment for $APP_NAME"
echo "----------------------------------------------------"

# 1. Pull latest code from GitHub
echo "[1/6] Pulling latest updates from Git..."
git pull origin main

# 2. Verify .env file existence
echo "[2/6] Checking environment configuration..."
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE file not found!"
    echo "Please create a $ENV_FILE file with your production keys before deploying."
    exit 1
fi

echo "Active configuration loaded from $ENV_FILE"

# 3. Build Docker Image
echo "[3/6] Building Docker image '${APP_NAME}:latest'..."
docker build -t "${APP_NAME}:latest" .

# 4. Stop and remove existing container if running
echo "[4/6] Stopping existing container..."
existingContainer=$(docker ps -aq -f "name=^/${APP_NAME}$")
if [ -n "$existingContainer" ]; then
    echo "Stopping container $APP_NAME..."
    docker stop "$APP_NAME" > /dev/null || true
    echo "Removing container $APP_NAME..."
    docker rm "$APP_NAME" > /dev/null || true
fi

# 5. Run new container with --env-file .env
echo "[5/6] Starting container listening on localhost:$PORT..."
docker run -d \
  --name "$APP_NAME" \
  --restart unless-stopped \
  -p 127.0.0.1:${PORT}:3000 \
  --env-file "$ENV_FILE" \
  "${APP_NAME}:latest"

# 6. Verify container status
echo "[6/6] Checking container status..."
sleep 3

runningContainer=$(docker ps -q -f "name=^/${APP_NAME}$" -f "status=running")
if [ -n "$runningContainer" ]; then
    echo "SUCCESS: Container '$APP_NAME' is UP and running on port $PORT!"
else
    echo "ERROR: Container failed to start. Displaying container logs:"
    docker logs "$APP_NAME"
    exit 1
fi

echo "----------------------------------------------------"
echo "Deployment successful!"
echo "----------------------------------------------------"
