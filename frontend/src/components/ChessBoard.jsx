import { useState, useEffect, useRef } from 'react';
import SimpleChessBoard from './SimpleChessBoard';
import { Chess } from 'chess.js';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/game';

export default function ChessBoard() {
  const [game, setGame] = useState(new Chess());
  const [boardPosition, setBoardPosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'); // Starting position FEN
  const [boardKey, setBoardKey] = useState(Date.now()); // Timestamp for complete remount
  const [moveInput, setMoveInput] = useState('');
  const [feedback, setFeedback] = useState('Click "New Game" to start!');
  const [loading, setLoading] = useState(false);
  const [gamePhase, setGamePhase] = useState('opening');
  const [playerElo, setPlayerElo] = useState(800);
  const [coachingIntensity, setCoachingIntensity] = useState('medium');
  const [lastMove, setLastMove] = useState(null); // Track last move for highlighting
  const inputRef = useRef(null); // Reference for the input field

  // Auto-start a new game when component mounts
  useEffect(() => {
    startNewGame();
  }, []);

  // Auto-focus input after each move
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading, boardPosition]);

  const startNewGame = async () => {
    try {
      await axios.post(`${API_BASE_URL}/new`, {
        player_color: 'white'
      });
      const newGame = new Chess();
      setGame(newGame);
      setBoardPosition(newGame.fen());
      setFeedback('New game started! Make your first move.');
      setGamePhase('opening');
    } catch (error) {
      console.error('Error starting game:', error);
      setFeedback('Error starting new game. Make sure backend is running on port 5001.');
    }
  };

  const makeMove = async () => {
    if (!moveInput.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/move`, {
        move: moveInput,
        player_elo: playerElo,
        coaching_intensity: coachingIntensity
      });

      if (response.data.success) {
        // Get FEN from backend
        const newFen = response.data.board_state.fen;
        
        // Update game state and board position
        const newGame = new Chess(newFen);
        setGame(newGame);
        setBoardPosition(newFen);
        setBoardKey(Date.now());
        setLastMove(response.data.move); // Store the move for highlighting
        
        setFeedback(response.data.coaching_feedback);
        setGamePhase(response.data.game_phase);
        setMoveInput('');
        
        console.log('Board updated to:', newFen);
        console.log('Move made:', response.data.move);
      } else {
        setFeedback(`Invalid move: ${response.data.error}\n\nTip: For captures, use format like 'exd5' or 'Nxe5'`);
      }
    } catch (error) {
      console.error('Error making move:', error);
      setFeedback('Error making move. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      makeMove();
    }
  };

  return (
    <div className="h-screen bg-gray-100 p-4 overflow-hidden flex flex-col">
      <div className="w-full h-full flex flex-col">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-800">
          Chess Coach
        </h1>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden max-w-[1600px] mx-auto w-full">
          {/* Left Side - Chess Board */}
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center justify-start">
            <div className="mb-4 w-full flex justify-center">
              <SimpleChessBoard fen={boardPosition} />
            </div>
  
            <div className="space-y-2 w-full" style={{ maxWidth: 'min(90%, 500px)' }}>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={moveInput}
                  onChange={(e) => setMoveInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter move (e.g., e4, Nf3)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={loading}
                  autoFocus
                />
                <button
                  onClick={makeMove}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 text-sm font-medium whitespace-nowrap"
                >
                  {loading ? 'Analyzing...' : 'Move'}
                </button>
              </div>
  
              <button
                onClick={startNewGame}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
              >
                New Game
              </button>
  
              <div className="flex gap-3 text-sm">
                <div className="flex-1">
                  <label className="block text-gray-700 mb-1 text-xs">Your ELO</label>
                  <input
                    type="number"
                    value={playerElo}
                    onChange={(e) => setPlayerElo(Number(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 mb-1 text-xs">Coaching</label>
                  <select
                    value={coachingIntensity}
                    onChange={(e) => setCoachingIntensity(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
  
              <div className="text-xs text-gray-600 space-y-1">
                <p>Phase: <span className="font-semibold capitalize">{gamePhase}</span></p>
                <p>Turn: <span className="font-semibold capitalize">{game.turn() === 'w' ? 'White' : 'Black'}</span></p>
                <p className="text-blue-600">FEN: {boardPosition.substring(0, 30)}...</p>
              </div>
            </div>
          </div>
  
          {/* Right Side - Coaching Feedback */}
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col overflow-hidden">
            <h2 className="text-xl font-bold mb-3 text-gray-800 flex-shrink-0">Coach's Feedback</h2>
            <div className="prose prose-sm max-w-none overflow-y-auto flex-1">
              {feedback ? (
                <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">{feedback}</p>
              ) : (
                <p className="text-gray-400 italic text-sm">
                  Click "New Game" to start, then enter your moves to receive coaching!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}