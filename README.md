# Chess Coach

An AI-powered chess coaching application that provides real-time feedback on your moves using Claude AI. Built with a custom chess board component, responsive design, and intelligent move analysis.

![Chess Coach](https://img.shields.io/badge/AI-Claude%20Sonnet%204-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![React](https://img.shields.io/badge/React-19.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **Real-time Move Analysis**: Enter moves in algebraic notation and receive instant AI coaching feedback
- **Multi-Move Mode**: Make multiple moves before getting coaching - perfect for practicing sequences
- **Interactive Board**: Click pieces to make moves and learn notation visually
- **Undo Moves**: Quickly fix mistakes with ↩️ Undo button or Ctrl+Z / ⌘Z keyboard shortcut
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

### Installation

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
4. **Multi-Move Mode** (NEW!):
   - Toggle **"Multi-Move: OFF"** → **"🎯 Multi-Move: ON"** (purple button)
   - Make multiple moves without coaching interruption
   - Perfect for practicing openings or exploring variations
   - Click **"Get Coaching (3)"** when ready for AI analysis
   - Counter shows how many moves you've made
5. **Undo mistakes:** 
   - Click the **↩️ Undo** button
   - Or press **Ctrl+Z** (Windows/Linux) or **⌘Z** (Mac)
   - Works in both single-move and multi-move modes
6. **Get AI coaching:**
   - In single-move mode: Instant feedback after each move
   - In multi-move mode: Click "Get Coaching" when ready
   - Adjust coaching intensity and your ELO rating
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
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/game/new` | Start a new game |
| POST | `/api/game/move` | Make a move and get coaching |
| POST | `/api/game/undo` | Undo the last move |
| POST | `/api/game/batch-moves` | Submit multiple moves at once |
| GET | `/api/game/state` | Get current board state |
| POST | `/api/game/save` | Save completed game |
| GET | `/api/game/games` | Get all saved games |
| GET | `/api/game/stats` | Get win/loss statistics |

## 🎨 Recent Updates

### v1.2.0 (Latest)
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

**Board not updating?**
- Hard refresh browser (`Cmd+Shift+R` on Mac, `Ctrl+Shift+R` on Windows)
- Check console for errors
- Verify backend is running on port 5001

**"Invalid move" errors?**
- Use proper algebraic notation
- For captures, include the 'x': `exd5` not `ed5`
- Check the current turn (White/Black indicator)

**Backend not starting?**
- Activate virtual environment: `source venv/bin/activate`
- Install dependencies: `pip3 install -r requirements.txt`
- Check `.env` file has valid `ANTHROPIC_API_KEY`

**Frontend not loading?**
- Run `npm install` to ensure dependencies are installed
- Check port 5173 is not in use
- Verify backend is running (frontend needs API)

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
