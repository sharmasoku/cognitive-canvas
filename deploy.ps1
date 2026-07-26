# ==============================================================================
# Direct Deployment Script for TeleARGlass (Windows PowerShell)
# (Docker Container + Local Reverse Proxy on Port 3000)
# ==============================================================================
# Usage in PowerShell: .\deploy.ps1
# ==============================================================================

$ErrorActionPreference = "Stop"

$APP_NAME = "telearglass"
$PORT = "3000"
$ENV_FILE = ".env"

Write-Host "----------------------------------------------------" -ForegroundColor Cyan
Write-Host "Starting Automated Deployment for $APP_NAME" -ForegroundColor Cyan
Write-Host "----------------------------------------------------" -ForegroundColor Cyan

# 1. Pull latest code from GitHub
Write-Host "[1/6] Pulling latest updates from Git..." -ForegroundColor Yellow
git pull origin main

# 2. Verify .env file existence
Write-Host "[2/6] Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path $ENV_FILE)) {
    if (Test-Path "env") {
        Write-Host "Found 'env' file without dot. Copying to '$ENV_FILE'..." -ForegroundColor Yellow
        Copy-Item -Path "env" -Destination $ENV_FILE
    } else {
        Write-Host "Error: $ENV_FILE file not found!" -ForegroundColor Red
        Write-Host "Please create a $ENV_FILE file with your production keys before deploying." -ForegroundColor Red
        exit 1
    }
}

# 3. Build Docker Image
Write-Host "[3/6] Building Docker image '${APP_NAME}:latest'..." -ForegroundColor Yellow
docker build -t "${APP_NAME}:latest" .

# 4. Stop and remove existing container if running
Write-Host "[4/6] Stopping existing container..." -ForegroundColor Yellow
$existingContainer = docker ps -aq -f "name=^/${APP_NAME}$"
if ($existingContainer) {
    Write-Host "Stopping container $APP_NAME..." -ForegroundColor Gray
    docker stop $APP_NAME | Out-Null
    Write-Host "Removing container $APP_NAME..." -ForegroundColor Gray
    docker rm $APP_NAME | Out-Null
}

# 5. Run new container
Write-Host "[5/6] Starting container listening on localhost:$PORT..." -ForegroundColor Yellow
$dockerArgs = @(
    "run", "-d",
    "--name", $APP_NAME,
    "--restart", "unless-stopped",
    "-p", "127.0.0.1:${PORT}:3000",
    "--env-file", $ENV_FILE,
    "${APP_NAME}:latest"
)
docker @dockerArgs

# 6. Verify container status
Write-Host "[6/6] Checking container status..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

$runningContainer = docker ps -q -f "name=^/${APP_NAME}$" -f "status=running"
if ($runningContainer) {
    Write-Host "SUCCESS: Container '$APP_NAME' is UP and running on port $PORT!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Container failed to start. Displaying container logs:" -ForegroundColor Red
    docker logs $APP_NAME
    exit 1
}

Write-Host "----------------------------------------------------" -ForegroundColor Cyan
Write-Host "Deployment successful!" -ForegroundColor Cyan
Write-Host "----------------------------------------------------" -ForegroundColor Cyan
