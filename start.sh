#!/bin/bash

# Chess Coach Startup Script
# Automatically starts backend and frontend servers

echo "🚀 Starting Chess Coach..."
echo ""

# Store the project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# Check if backend virtual environment exists
if [ ! -d "$PROJECT_ROOT/backend/venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Creating virtual environment..."
    cd "$PROJECT_ROOT/backend"
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing backend dependencies..."
    pip3 install -r requirements.txt
    cd "$PROJECT_ROOT"
fi

# Check if .env exists
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo "⚠️  Warning: backend/.env file not found!"
    echo "Please create it with your ANTHROPIC_API_KEY"
    echo ""
fi

# Check if frontend dependencies are installed
if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd "$PROJECT_ROOT/frontend"
    npm install
    cd "$PROJECT_ROOT"
fi

# Kill any existing processes on ports 5001 and 5173
echo "🧹 Cleaning up existing processes..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Start backend server
echo "🔧 Starting backend server (port 5001)..."
cd "$PROJECT_ROOT/backend"
source venv/bin/activate
python run.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
cd "$PROJECT_ROOT"

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "🎨 Starting frontend dev server (port 5173)..."
cd "$PROJECT_ROOT/frontend"
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
cd "$PROJECT_ROOT"

# Save PIDs to file for stop script
mkdir -p "$PROJECT_ROOT/logs"
echo "$BACKEND_PID" > "$PROJECT_ROOT/logs/backend.pid"
echo "$FRONTEND_PID" > "$PROJECT_ROOT/logs/frontend.pid"

echo ""
echo "✅ Chess Coach is starting up!"
echo ""
echo "   Backend:  http://localhost:5001"
echo "   Frontend: http://localhost:5173"
echo ""
echo "📋 Logs available at:"
echo "   Backend:  logs/backend.log"
echo "   Frontend: logs/frontend.log"
echo ""
echo "🛑 To stop servers, run: ./stop.sh"
echo ""
echo "⏳ Waiting for servers to be ready..."
sleep 3

# Check if servers are running
if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo "   ✅ Backend is healthy"
else
    echo "   ⚠️  Backend may still be starting..."
fi

if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "   ✅ Frontend is ready"
else
    echo "   ⏳ Frontend is starting (may take a few more seconds)..."
fi

echo ""
echo "🎉 Ready! Open http://localhost:5173 in your browser"
echo ""
