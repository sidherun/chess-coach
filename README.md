# Chess Coach

An AI-powered chess coaching application that provides real-time feedback on your moves using Claude AI. Built with a custom chess board component, responsive design, and intelligent move analysis.

![Chess Coach](https://img.shields.io/badge/AI-Claude%20Sonnet%204-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![React](https://img.shields.io/badge/React-19.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **Real-time Move Analysis**: Enter moves in algebraic notation and receive instant AI coaching feedback
- **AI Chat Assistant**: Ask follow-up questions about coaching, positions, and chess concepts
- **Multi-Move Mode**: Make multiple moves before getting coaching - perfect for practicing sequences
- **Interactive Board**: Click pieces to make moves and learn notation visually
- **Undo Moves**: Quickly fix mistakes with ↩️ Undo button or Ctrl+Z / ⌘Z keyboard shortcut
- **Dynamic Turn Indicators**: Visual turn indicators positioned beside the active player's side
- **Resizable Layout**: Drag separator between coaching and chat sections to customize view
- **One-Command Startup**: Automated scripts handle all setup (`./start.sh` or `start.bat`)
- **Adaptive Coaching**: Adjust coaching intensity (low, medium, high) based on your needs
- **ELO-based Guidance**: Tailored advice appropriate to your skill level (default 800 ELO)
- **Game Phase Awareness**: Different coaching strategies for opening, middlegame, and endgame
- **Custom Chess Board**: Professional design with clear, high-contrast pieces (lichess.org color scheme)
- **Visual Learning**: Coordinate labels on every square, legal move indicators, and move highlighting
- **Auto-Focus Input**: Cursor automatically ready after each move for rapid play
- **Responsive Design**: Works seamlessly on laptop screens and external monitors
- **Game History**: Save and review your games with move tracking
- **Move Validation**: Helpful error messages with capture notation tips

## 🎮 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 18 or higher
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Easy Setup (Recommended)

**1. Clone and setup:**
```bash
git clone https://github.com/sidherun/chess-coach.git
cd chess-coach

# Create .env file with your API key
echo "ANTHROPIC_API_KEY=your_api_key_here" > backend/.env
echo "PORT=5001" >> backend/.env
```

**2. Run the app:**

**Mac/Linux:**
```bash
./start.sh
```

**Windows:**
```bash
start.bat
```

The script will automatically:
- ✅ Create virtual environment (first run only)
- ✅ Install all dependencies (first run only)
- ✅ Start backend server (port 5001)
- ✅ Start frontend dev server (port 5173)
- ✅ Open logs for debugging

**3. Open your browser:**
```
http://localhost:5173
```

**4. To stop servers:**

**Mac/Linux:**
```bash
./stop.sh
```

**Windows:**
```bash
stop.bat
```

---

### Manual Setup (Alternative)

**1. Clone the repository:**
```bash
git clone https://github.com/sidherun/chess-coach.git
cd chess-coach
```

**2. Backend Setup:**
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip3 install -r requirements.txt

# Create .env file
echo "ANTHROPIC_API_KEY=your_api_key_here" > .env
echo "PORT=5001" >> .env

# Run backend
python run.py
```

**3. Frontend Setup (in new terminal):**
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**4. Open your browser:**
```
http://localhost:5173
```

## 🎯 How to Play

1. The game auto-starts when you open the app
2. **Two ways to make moves:**
   - **Click the board**: Click a piece, then click destination (great for learning!)
   - **Type notation**: Enter moves in text box (e.g., `e4`, `Nf3`)
3. **Learn notation visually:**
   - Click pieces to see green indicators for legal moves
   - After moving, see "✓ You just played: **e4**" to learn notation
   - Coordinate labels (a1-h8) visible on every square
   - Turn indicators show whose turn it is (positioned beside the board)
4. **Ask Questions** (NEW!):
   - Use the chat interface to ask follow-up questions
   - Get context-aware answers about your position
   - Ask "Why was e4 good?" or "What should I focus on?"
   - Resizable chat section - drag separator to adjust
5. **Multi-Move Mode**:
   - Toggle **"Multi-Move: OFF"** → **"🎯 Multi-Move: ON"** (purple button)
   - Make multiple moves without coaching interruption
   - Perfect for practicing openings or exploring variations
   - Click **"Get Coaching (3)"** when ready for AI analysis
   - Counter shows how many moves you've made
6. **Undo mistakes:** 
   - Click the **↩️ Undo** button
   - Or press **Ctrl+Z** (Windows/Linux) or **⌘Z** (Mac)
   - Works in both single-move and multi-move modes
7. **Get AI coaching:**
   - In single-move mode: Instant feedback after each move
   - In multi-move mode: Click "Get Coaching" when ready
   - Adjust coaching intensity in the feedback section header
   - Set your ELO rating in the top-left header
   - Learn opening principles, tactics, and strategy

### Move Notation Reference:
- **Pawn moves**: `e4`, `d5`, `c3`
- **Piece moves**: `Nf3`, `Bc4`, `Qh5`
- **Captures**: `exd5`, `Nxe5`, `Bxf7`
- **Castling**: `O-O` (kingside), `O-O-O` (queenside)
- **Check/Checkmate**: `Qh5+`, `Qxf7#`

## 🏗️ Tech Stack

### Backend
- **Flask** - REST API framework
- **python-chess** - Chess logic and validation
- **Anthropic Claude API** - AI coaching engine
- **SQLAlchemy** - Game storage and history
- **python-dotenv** - Environment configuration

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **chess.js** - Chess move validation
- **Axios** - HTTP client
- **Custom Chess Board** - Hand-built component with unicode pieces

## 📁 Project Structure

```
chess-coach/
├── backend/
│   ├── app/
│   │   ├── models/          # Database models (Game, CoachingFeedback)
│   │   ├── routes/          # API endpoints
│   │   │   └── game_routes.py
│   │   ├── services/        # Business logic
│   │   │   ├── chess_service.py    # Chess game management
│   │   │   └── claude_service.py   # AI coaching logic
│   │   └── utils/           # Helper functions
│   ├── .env.example         # Environment variables template
│   ├── requirements.txt     # Python dependencies
│   └── run.py              # Flask app entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChessBoard.jsx       # Main game component
│   │   │   └── SimpleChessBoard.jsx # Custom board renderer
│   │   ├── App.jsx          # Root component
│   │   └── main.jsx         # Entry point
│   ├── package.json         # Node dependencies
│   ├── postcss.config.js    # Tailwind CSS configuration
│   └── vite.config.js       # Vite configuration
├── start.sh / start.bat     # One-command startup scripts
├── stop.sh / stop.bat       # Server shutdown scripts
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/game/new` | Start a new game |
| POST | `/api/game/move` | Make a move and get coaching |
| POST | `/api/game/undo` | Undo the last move |
| POST | `/api/game/chat` | Ask follow-up questions about coaching/position |
| POST | `/api/game/batch-moves` | Submit multiple moves at once |
| GET | `/api/game/state` | Get current board state |
| POST | `/api/game/save` | Save completed game |
| GET | `/api/game/games` | Get all saved games |
| GET | `/api/game/stats` | Get win/loss statistics |

## 🎨 Recent Updates

### v1.3.0 (Latest)
- ✅ **AI Chat Assistant** - Ask follow-up questions about coaching and positions
- ✅ Context-aware responses based on current game state
- ✅ ELO-appropriate explanations and terminology
- ✅ **Resizable UI** - Drag separator between coaching and chat sections
- ✅ **Dynamic Turn Indicators** - Visual indicators positioned beside active player
- ✅ **Improved Layout** - New Game and ELO in top header
- ✅ **Larger Board** - Increased from 512px to 640px for better visibility
- ✅ Coaching intensity control in feedback section header
- ✅ Cleaner, more organized UI with better space utilization

### v1.2.1
- ✅ **One-Command Startup** - Automated scripts for easy development (`./start.sh` or `start.bat`)
- ✅ Auto-creates virtual environment on first run
- ✅ Auto-installs all dependencies
- ✅ Starts both backend and frontend with one command
- ✅ Background process management with logging
- ✅ Graceful shutdown with `./stop.sh` or `stop.bat`
- ✅ Error detection and reporting in logs

### v1.2.0
- ✅ **Multi-Move Mode** - Make multiple moves before getting coaching feedback
- ✅ Purple toggle button with clear ON/OFF states
- ✅ "Get Coaching" button shows move counter (e.g., "Get Coaching (3)")
- ✅ Local undo support in multi-move mode
- ✅ Confirmation dialog prevents accidental loss of unsaved moves
- ✅ Uses `/batch-moves` endpoint for efficient bulk analysis
- ✅ Perfect for practicing opening sequences and exploring variations

### v1.1.0
- ✅ **Undo feature** - Fix mistakes with button or Ctrl+Z/⌘Z keyboard shortcut
- ✅ Keyboard shortcut UI hint for discoverability
- ✅ Tooltip on undo button showing shortcut

### v1.0.0 (Initial Release)
- ✅ Custom chess board component with professional lichess.org colors
- ✅ Interactive clickable board for learning notation
- ✅ Legal move indicators (green dots/circles)
- ✅ Coordinate labels on all squares (a1-h8)
- ✅ Move highlighting (yellow=from, green=to)
- ✅ Auto-focus input field for rapid move entry
- ✅ Responsive layout for all screen sizes
- ✅ Real-time AI coaching with Claude Sonnet 4
- ✅ Move validation with helpful error messages
- ✅ Game phase detection (opening/middlegame/endgame)
- ✅ ELO-based coaching adaptation
- ✅ Tailwind CSS v4 integration

## 🚀 Deployment

### Local Development
Already running! See Quick Start above.

### Production Considerations
- Set `debug=False` in `run.py`
- Use a production WSGI server (gunicorn, uWSGI)
- Set up proper database (PostgreSQL recommended)
- Configure environment variables securely
- Use HTTPS for API key security

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Notes

### Backend
- Uses in-memory SQLite database (games stored in `chess_coach.db`)
- Virtual environment recommended (`venv/`)
- API key must be set in `.env` file

### Frontend
- Hot module reloading enabled via Vite
- Tailwind CSS configured with PostCSS
- Custom board uses unicode chess symbols for pieces

## 🐛 Troubleshooting

**Servers not starting?**
- Use the startup script: `./start.sh` (or `start.bat` on Windows)
- Check logs at `logs/backend.log` and `logs/frontend.log`
- Ensure ports 5001 and 5173 are available

**Board not updating?**
- Hard refresh browser (`Cmd+Shift+R` on Mac, `Ctrl+Shift+R` on Windows)
- Check console for errors
- Verify backend is running on port 5001

**"Invalid move" errors?**
- Use proper algebraic notation
- For captures, include the 'x': `exd5` not `ed5`
- Check the current turn (White/Black indicator)

**Backend not starting?**
- Check `.env` file has valid `ANTHROPIC_API_KEY`
- If using manual setup, activate virtual environment: `source venv/bin/activate`
- Install dependencies: `pip3 install -r requirements.txt`

**Frontend not loading?**
- Run `npm install` in the `frontend/` directory
- Check port 5173 is not in use: `lsof -ti:5173` (Mac/Linux)
- Verify backend is running (frontend needs API)

**Multi-move mode not working?**
- Make sure you've clicked the "Multi-Move: OFF" button to toggle it ON
- Click "Get Coaching" when ready to analyze your moves
- Check backend logs for API errors

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Anthropic** - Claude AI for intelligent coaching
- **python-chess** - Robust chess logic library
- **chess.js** - JavaScript chess utilities
- **Lichess.org** - Inspiration for board design
- Built with assistance from Claude (Anthropic)

## 📧 Contact

Project Link: [https://github.com/sidherun/chess-coach](https://github.com/sidherun/chess-coach)

---

**Happy Learning! ♟️**
