#!/usr/bin/env bash

# ==============================================================================
# Direct Deployment Script for TeleARGlass
# (Docker Container + Nginx Reverse Proxy with SSL on Port 443)
# ==============================================================================
# Usage: ./deploy.sh
# Make executable first: chmod +x deploy.sh
# ==============================================================================

set -e # Exit script on any command failure

APP_NAME="telearglass"
PORT="3000"
ENV_FILE=".env"

echo "----------------------------------------------------"
echo "🚀 Starting Automated Deployment for $APP_NAME"
echo "----------------------------------------------------"

# 1. Pull latest code from GitHub
echo "📥 [1/6] Pulling latest updates from Git..."
git pull origin main

# 2. Verify .env file existence
echo "⚙️  [2/6] Checking environment configuration..."
if [ ! -f "$ENV_FILE" ]; then
    if [ -f "env" ]; then
        echo "⚠️  Found 'env' file without dot. Copying to '$ENV_FILE'..."
        cp env .env
    else
        echo "❌ Error: $ENV_FILE file not found!"
        echo "Please create a $ENV_FILE file with your production keys before deploying."
        exit 1
    fi
fi

# 3. Build Docker Image
echo "🔨 [3/6] Building Docker image '$APP_NAME:latest'..."
docker build -t "$APP_NAME:latest" .

# 4. Stop and remove existing container if running
echo "🛑 [4/6] Stopping existing container..."
if [ "$(docker ps -aq -f name=^/${APP_NAME}$)" ]; then
    docker stop "$APP_NAME" || true
    docker rm "$APP_NAME" || true
fi

# 5. Run new container
echo "🏃 [5/6] Starting container listening on localhost:$PORT..."
docker run -d \
  --name "$APP_NAME" \
  --restart unless-stopped \
  -p 127.0.0.1:${PORT}:3000 \
  --env-file "$ENV_FILE" \
  "$APP_NAME:latest"

# 6. Verify container status and reload Nginx
echo "🔍 [6/6] Checking container status & reloading Nginx..."
sleep 3

if [ "$(docker ps -q -f name=^/${APP_NAME}$ -f status=running)" ]; then
    echo "✅ Container '$APP_NAME' is UP and running!"
else
    echo "❌ Error: Container failed to start. Displaying container logs:"
    docker logs "$APP_NAME"
    exit 1
fi

if command -v nginx > /dev/null 2>&1; then
    echo "🌐 Reloading Nginx server..."
    sudo nginx -t && sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully!"
else
    echo "ℹ️  Nginx command not detected directly. Make sure Nginx proxies port 443 -> port $PORT."
fi

echo "----------------------------------------------------"
echo "🎉 Deployment successful!"
echo "----------------------------------------------------"
