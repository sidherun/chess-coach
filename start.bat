@echo off
REM Chess Coach Startup Script for Windows
REM Automatically starts backend and frontend servers

echo 🚀 Starting Chess Coach...
echo.

cd /d "%~dp0"
set PROJECT_ROOT=%CD%

REM Check if backend virtual environment exists
if not exist "%PROJECT_ROOT%\backend\venv" (
    echo ❌ Virtual environment not found!
    echo Creating virtual environment...
    cd "%PROJECT_ROOT%\backend"
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Installing backend dependencies...
    pip install -r requirements.txt
    cd "%PROJECT_ROOT%"
)

REM Check if .env exists
if not exist "%PROJECT_ROOT%\backend\.env" (
    echo ⚠️  Warning: backend\.env file not found!
    echo Please create it with your ANTHROPIC_API_KEY
    echo.
)

REM Check if frontend dependencies are installed
if not exist "%PROJECT_ROOT%\frontend\node_modules" (
    echo Installing frontend dependencies...
    cd "%PROJECT_ROOT%\frontend"
    call npm install
    cd "%PROJECT_ROOT%"
)

REM Create logs directory
if not exist "%PROJECT_ROOT%\logs" mkdir "%PROJECT_ROOT%\logs"

REM Kill any existing processes on ports 5001 and 5173
echo 🧹 Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5001" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

REM Start backend server
echo 🔧 Starting backend server (port 5001)...
cd "%PROJECT_ROOT%\backend"
start "Chess Coach Backend" /MIN cmd /c "call venv\Scripts\activate.bat && python run.py > ..\logs\backend.log 2>&1"
cd "%PROJECT_ROOT%"

REM Wait for backend to start
timeout /t 2 /nobreak > nul

REM Start frontend server
echo 🎨 Starting frontend dev server (port 5173)...
cd "%PROJECT_ROOT%\frontend"
start "Chess Coach Frontend" /MIN cmd /c "npm run dev > ..\logs\frontend.log 2>&1"
cd "%PROJECT_ROOT%"

echo.
echo ✅ Chess Coach is starting up!
echo.
echo    Backend:  http://localhost:5001
echo    Frontend: http://localhost:5173
echo.
echo 📋 Logs available at:
echo    Backend:  logs\backend.log
echo    Frontend: logs\frontend.log
echo.
echo 🛑 To stop servers, run: stop.bat
echo.
echo ⏳ Waiting for servers to be ready...
timeout /t 3 /nobreak > nul

echo.
echo 🎉 Ready! Open http://localhost:5173 in your browser
echo.
pause
