@echo off
REM VSM_GAME Docker Setup Verification Script (Windows PowerShell)

echo.
echo ============================================
echo   VSM_GAME Docker Setup Verification
echo ============================================
echo.

REM Check Docker installation
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker is not installed
    exit /b 1
)

for /f "tokens=*" %%i in ('docker --version') do set DOCKER_VERSION=%%i
echo Docker installed: %DOCKER_VERSION%

REM Check Docker Compose
docker compose version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker Compose is not installed
    exit /b 1
)

for /f "tokens=*" %%i in ('docker compose version') do set COMPOSE_VERSION=%%i
echo Docker Compose installed: %COMPOSE_VERSION%

echo.
echo Building images...
docker compose build

echo.
echo Starting services...
docker compose up -d

echo.
echo Waiting for services to be healthy...
timeout /t 10 /nobreak

echo.
echo Service Status:
echo ===============
docker compose ps

echo.
echo API Endpoints:
echo ==============
echo Frontend:  http://localhost:8080
echo Backend:   http://localhost:8000
echo Admin:     http://localhost:8000/admin

echo.
echo Setup complete!
echo.
echo To stop services:  docker compose down
echo To view logs:      docker compose logs -f
echo.
