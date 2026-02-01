@echo off
REM Chess Coach Stop Script for Windows
REM Stops backend and frontend servers

echo 🛑 Stopping Chess Coach...
echo.

REM Kill processes by port
echo Stopping backend...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5001" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo Stopping frontend...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

REM Kill by window title as backup
taskkill /FI "WINDOWTITLE eq Chess Coach Backend*" /F 2>nul
taskkill /FI "WINDOWTITLE eq Chess Coach Frontend*" /F 2>nul

echo.
echo ✅ All servers stopped
echo.
pause
