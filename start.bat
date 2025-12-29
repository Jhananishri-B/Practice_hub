@echo off
REM AI Practice Hub - Startup Script for Windows

echo 🚀 Starting AI Practice Hub...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Start backend and database
echo 📦 Starting Docker containers (Backend + Database)...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to initialize...
timeout /t 5 /nobreak >nul

REM Check if backend is healthy
echo 🔍 Checking backend health...
set /a attempts=0
:check_backend
curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    set /a attempts+=1
    if %attempts% lss 30 (
        timeout /t 1 /nobreak >nul
        goto check_backend
    ) else (
        echo ⚠️  Backend is taking longer than expected. Check logs with: docker-compose logs backend
    )
) else (
    echo ✅ Backend is ready!
)

REM Check if frontend dependencies are installed
if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo    1. Start frontend: cd frontend ^&^& npm run dev
echo    2. Open browser: http://localhost:5173
echo    3. Login with USER/123 (student) or ADMIN/123 (admin)
echo.
echo 📊 View logs: docker-compose logs -f
echo 🛑 Stop services: docker-compose down
echo.
pause

