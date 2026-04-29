@echo off
echo ============================================
echo  Student Management System - Start Servers
echo ============================================

echo.
echo [1/2] Starting Backend Server (Port 5000)...
start "SMS Backend" cmd /k "cd /d "%~dp0backend" && node server.js"

echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak > nul

echo.
echo [2/2] Starting Frontend Server (Port 5173)...
start "SMS Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ============================================
echo  Both servers started!
echo  Backend  -> http://localhost:5000
echo  Frontend -> http://localhost:5173
echo ============================================
echo.
pause
