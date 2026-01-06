@echo off
echo Starting AI Practice Hub locally...

:: Start Backend
start "Practice Hub Backend" cmd /k "cd backend && npm run dev"

:: Start Frontend
start "Practice Hub Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Servers are being started in separate windows!
echo.
echo Backend URL: http://localhost:5000
echo Frontend URL: http://localhost:5173 (Opening in 5 seconds...)
echo.

timeout /t 5
start http://localhost:5173
