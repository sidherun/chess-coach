# Chess Coach

An AI-powered chess coaching application that provides real-time feedback on your moves using Claude AI.

## Features

- **Real-time Move Analysis**: Enter moves in algebraic notation and receive instant coaching feedback
- **Adaptive Coaching**: Adjust coaching intensity (low, medium, high) based on your needs
- **ELO-based Guidance**: Tailored advice appropriate to your skill level (default 800 ELO)
- **Game Phase Awareness**: Different coaching strategies for opening, middlegame, and endgame
- **Beautiful UI**: Responsive design that works on laptop and external monitors
- **Game History**: Save and review your games

## Tech Stack

### Backend
- Python 3.8+
- Flask (REST API)
- python-chess (chess logic)
- Anthropic Claude API (AI coaching)
- SQLAlchemy (game storage)

### Frontend
- React 19
- Vite
- Tailwind CSS
- Axios
- chess.js

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js 18 or higher
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory:
```bash
ANTHROPIC_API_KEY=your_api_key_here
PORT=5001
```

5. Run the backend server:
```bash
python run.py
```

The backend will start on `http://localhost:5001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

1. Open your browser to `http://localhost:5173`
2. The game will auto-start with a new board
3. Enter moves in algebraic notation (e.g., `e4`, `Nf3`, `Bxf7+`)
4. Click "Move" or press Enter
5. Receive coaching feedback from Claude AI
6. Adjust your ELO and coaching intensity as needed

## Move Notation Examples

- **Pawn moves**: `e4`, `d5`, `c3`
- **Piece moves**: `Nf3` (knight to f3), `Bc4` (bishop to c4)
- **Captures**: `exd5` (pawn takes on d5), `Nxe5` (knight takes on e5)
- **Castling**: `O-O` (kingside), `O-O-O` (queenside)
- **Check**: `Qh5+`
- **Checkmate**: `Qxf7#`

## Project Structure

```
chess-coach/
├── backend/
│   ├── app/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── requirements.txt    # Python dependencies
│   └── run.py             # Flask app entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json       # Node dependencies
│   └── vite.config.js     # Vite configuration
└── README.md
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/game/new` - Start a new game
- `POST /api/game/move` - Make a move and get coaching
- `GET /api/game/state` - Get current board state
- `POST /api/game/save` - Save completed game
- `GET /api/game/games` - Get all saved games
- `GET /api/game/stats` - Get win/loss statistics

## Contributing

Feel free to open issues or submit pull requests!

## License

MIT

## Acknowledgments

- Built with [Claude](https://www.anthropic.com/claude) by Anthropic
- Chess logic powered by [python-chess](https://python-chess.readthedocs.io/)
- Frontend chess logic by [chess.js](https://github.com/jhlywa/chess.js)
