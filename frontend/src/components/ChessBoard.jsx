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
  const [lastMoveFrom, setLastMoveFrom] = useState(null); // From square (e.g., "e2")
  const [lastMoveTo, setLastMoveTo] = useState(null); // To square (e.g., "e4")
  const [lastMoveNotation, setLastMoveNotation] = useState(''); // Move notation (e.g., "e4")
  const [selectedSquare, setSelectedSquare] = useState(null); // Currently selected square
  const [legalMoves, setLegalMoves] = useState([]); // Legal destination squares
  const [multiMoveMode, setMultiMoveMode] = useState(false); // Multi-move mode toggle
  const [moveHistory, setMoveHistory] = useState([]); // Collected moves in multi-move mode
  const [chatMessages, setChatMessages] = useState([]); // Chat history
  const [chatInput, setChatInput] = useState(''); // Current chat input
  const [chatLoading, setChatLoading] = useState(false); // Chat API loading state
  const [feedbackHeight, setFeedbackHeight] = useState(40); // Percentage height for feedback section
  const [isDragging, setIsDragging] = useState(false); // Resize drag state
  const inputRef = useRef(null); // Reference for the input field
  const chatEndRef = useRef(null); // Reference for auto-scrolling chat
  const rightPanelRef = useRef(null); // Reference for right panel container

  // Auto-start a new game when component mounts
  useEffect(() => {
    startNewGame();
  }, []);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle resize drag
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !rightPanelRef.current) return;

    const panel = rightPanelRef.current;
    const panelRect = panel.getBoundingClientRect();
    const mouseY = e.clientY - panelRect.top;
    const panelHeight = panelRect.height;
    
    // Calculate percentage (constrain between 20% and 80%)
    let newPercentage = (mouseY / panelHeight) * 100;
    newPercentage = Math.max(20, Math.min(80, newPercentage));
    
    setFeedbackHeight(newPercentage);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Auto-focus input after each move
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading, boardPosition]);

  // Add keyboard shortcut for undo (Ctrl+Z / Cmd+Z)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !loading) {
        e.preventDefault(); // Prevent browser undo
        undoLastMove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading]); // Re-attach when loading state changes

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
      setChatMessages([]); // Clear chat history
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
        
        // Parse the move to get from/to squares
        // The move from backend is in SAN format (e.g., "Nf3", "e4")
        // We need to use chess.js to get the actual squares
        const tempGame = new Chess(game.fen()); // Use current position
        try {
          const move = tempGame.move(moveInput); // This gives us {from, to, san}
          if (move) {
            setLastMoveFrom(move.from);
            setLastMoveTo(move.to);
            setLastMoveNotation(move.san);
          }
        } catch (e) {
          console.log('Could not parse move for highlighting:', e);
        }
        
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

  const undoLastMove = async () => {
    setLoading(true);
    setSelectedSquare(null);
    setLegalMoves([]);
    
    // If in multi-move mode and have local moves, just undo locally
    if (multiMoveMode && moveHistory.length > 0) {
      // Clone the game state properly and undo
      const newGame = new Chess(game.fen());
      // Copy move history by replaying moves
      const tempGame = new Chess();
      for (let i = 0; i < moveHistory.length - 1; i++) {
        tempGame.move(moveHistory[i].notation);
      }
      
      setGame(tempGame);
      setBoardPosition(tempGame.fen());
      setBoardKey(Date.now());
      
      const undoneMove = moveHistory[moveHistory.length - 1];
      const newHistory = moveHistory.slice(0, -1);
      setMoveHistory(newHistory);
      
      // Update highlighting to show previous move (if any)
      if (newHistory.length > 0) {
        const prevMove = newHistory[newHistory.length - 1];
        setLastMoveFrom(prevMove.from);
        setLastMoveTo(prevMove.to);
        setLastMoveNotation(prevMove.notation);
      } else {
        setLastMoveFrom(null);
        setLastMoveTo(null);
        setLastMoveNotation('');
      }
      
      setFeedback(`↩️ Undid move: ${undoneMove.notation} (${newHistory.length} move${newHistory.length !== 1 ? 's' : ''} remaining)`);
      setLoading(false);
      return;
    }
    
    // Normal backend undo
    try {
      const response = await axios.post(`${API_BASE_URL}/undo`);
      
      if (response.data.success) {
        const newFen = response.data.board_state.fen;
        
        // Update game state
        const newGame = new Chess(newFen);
        setGame(newGame);
        setBoardPosition(newFen);
        setBoardKey(Date.now());
        
        // Clear last move highlighting
        setLastMoveFrom(null);
        setLastMoveTo(null);
        setLastMoveNotation('');
        
        setGamePhase(response.data.game_phase);
        setFeedback(`↩️ Undid move: ${response.data.undone_move}`);
        
        console.log('Undid move:', response.data.undone_move);
      } else {
        setFeedback(`Cannot undo: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error undoing move:', error);
      setFeedback('Error undoing move. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getCoaching = async () => {
    if (moveHistory.length === 0) {
      setFeedback('No moves to analyze. Make some moves first!');
      return;
    }

    setLoading(true);
    
    try {
      // Send all collected moves to backend using batch-moves endpoint
      const moves = moveHistory.map(m => m.notation);
      
      const response = await axios.post(`${API_BASE_URL}/batch-moves`, {
        moves: moves,
        analyze_move: moves.length, // Analyze the last move
        player_elo: playerElo,
        coaching_intensity: coachingIntensity
      });

      if (response.data.success) {
        // Update board state from backend (to ensure sync)
        const newFen = response.data.board_state.fen;
        const newGame = new Chess(newFen);
        setGame(newGame);
        setBoardPosition(newFen);
        setBoardKey(Date.now());
        
        setFeedback(response.data.coaching_feedback || 'Moves submitted successfully!');
        
        // Clear multi-move history now that we've submitted
        setMoveHistory([]);
        
        console.log('Got coaching for', moves.length, 'moves:', moves.join(', '));
      } else {
        setFeedback(`Error getting coaching: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error getting coaching:', error);
      setFeedback('Error getting coaching. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMultiMoveMode = () => {
    if (multiMoveMode && moveHistory.length > 0) {
      // Warn if trying to turn off with unsaved moves
      if (!window.confirm(`You have ${moveHistory.length} unsaved move${moveHistory.length !== 1 ? 's' : ''}. Turn off multi-move mode?`)) {
        return;
      }
      setMoveHistory([]);
    }
    
    setMultiMoveMode(!multiMoveMode);
    setFeedback(
      multiMoveMode 
        ? 'Multi-move mode OFF. Moves will trigger instant coaching.' 
        : '🎯 Multi-move mode ON. Make multiple moves, then click "Get Coaching".'
    );
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    
    // Add user message to chat
    setChatMessages([...chatMessages, { role: 'user', content: userMessage }]);
    setChatLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        question: userMessage,
        recent_coaching: feedback,
        player_elo: playerElo
      });
      
      if (response.data.success) {
        // Add AI response to chat
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.data.answer 
        }]);
      } else {
        setChatMessages(prev => [...prev, { 
          role: 'error', 
          content: `Error: ${response.data.error}` 
        }]);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
      setChatMessages(prev => [...prev, { 
        role: 'error', 
        content: 'Failed to get response. Check console for details.' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSquareClick = (square) => {
    // If no square selected, select this square (if it has a piece of current turn)
    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        // Get legal moves for this piece
        const moves = game.moves({ square, verbose: true });
        setLegalMoves(moves.map(m => m.to));
      }
    } else {
      // A square is already selected, try to move there
      if (legalMoves.includes(square)) {
        // This is a legal move, make it!
        // Create temp game to get the move notation without mutating state
        const tempGame = new Chess(game.fen());
        const moveObj = tempGame.move({ from: selectedSquare, to: square });
        if (moveObj) {
          // Send to backend with the SAN notation
          makeMoveFromBoard(moveObj.san, moveObj.from, moveObj.to);
        }
      } else {
        // Not a legal move, maybe selecting a different piece?
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(square);
          const moves = game.moves({ square, verbose: true });
          setLegalMoves(moves.map(m => m.to));
        } else {
          // Clear selection
          setSelectedSquare(null);
          setLegalMoves([]);
        }
      }
    }
  };

  const makeMoveFromBoard = async (moveNotation, fromSquare, toSquare) => {
    setLoading(true);
    setSelectedSquare(null);
    setLegalMoves([]);
    
    // If in multi-move mode, just make the move locally
    if (multiMoveMode) {
      const tempGame = new Chess(game.fen());
      const move = tempGame.move(moveNotation);
      
      if (move) {
        // Update board locally
        setGame(tempGame);
        setBoardPosition(tempGame.fen());
        setBoardKey(Date.now());
        setLastMoveFrom(fromSquare);
        setLastMoveTo(toSquare);
        setLastMoveNotation(moveNotation);
        
        // Add to move history
        setMoveHistory([...moveHistory, { notation: moveNotation, from: fromSquare, to: toSquare }]);
        
        setFeedback(`Multi-move: ${moveHistory.length + 1} move${moveHistory.length + 1 !== 1 ? 's' : ''} made. Click "Get Coaching" when ready.`);
      }
      
      setLoading(false);
      return;
    }
    
    // Normal single-move mode with immediate coaching
    try {
      const response = await axios.post(`${API_BASE_URL}/move`, {
        move: moveNotation,
        player_elo: playerElo,
        coaching_intensity: coachingIntensity
      });

      if (response.data.success) {
        const newFen = response.data.board_state.fen;
        
        // Set the from/to squares for highlighting
        setLastMoveFrom(fromSquare);
        setLastMoveTo(toSquare);
        setLastMoveNotation(moveNotation);
        
        // Update game state
        const newGame = new Chess(newFen);
        setGame(newGame);
        setBoardPosition(newFen);
        setBoardKey(Date.now());
        
        setFeedback(response.data.coaching_feedback);
        setGamePhase(response.data.game_phase);
        
        console.log('Board updated to:', newFen);
        console.log('Move made:', moveNotation);
      } else {
        setFeedback(`Invalid move: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error making move:', error);
      setFeedback('Error making move. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-100 p-4 overflow-hidden flex flex-col">
      <div className="w-full h-full flex flex-col">
        {/* Header with New Game button and ELO */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={startNewGame}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium shadow-md"
            >
              ♟️ New Game
            </button>
            <div className="flex items-center gap-2">
              <label className="text-gray-700 text-xs font-medium">Your ELO:</label>
              <input
                type="number"
                value={playerElo}
                onChange={(e) => setPlayerElo(Number(e.target.value))}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 absolute left-1/2 transform -translate-x-1/2">
            Chess Coach
          </h1>
          <div className="w-40"></div> {/* Spacer for balance */}
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden max-w-[1600px] mx-auto w-full">
          {/* Left Side - Chess Board */}
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center overflow-y-auto">
            <div className="mb-4 w-full flex justify-center">
              {/* Board with turn indicators on sides */}
              <div className="flex items-center gap-4">
                {/* Turn indicator - positioned next to board */}
                <div className="flex flex-col justify-center h-[512px]">
                  {/* Black's turn indicator (top) */}
                  <div className={`mb-auto transition-all duration-300 ${
                    game.turn() === 'b' 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-95'
                  }`}>
                    <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg border-2 border-gray-600">
                      <div className="text-xs font-semibold">Black's Turn</div>
                      <div className="text-2xl">⚫</div>
                    </div>
                  </div>
                  
                  {/* White's turn indicator (bottom) */}
                  <div className={`mt-auto transition-all duration-300 ${
                    game.turn() === 'w' 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-95'
                  }`}>
                    <div className="bg-white text-gray-800 px-3 py-2 rounded-lg shadow-lg border-2 border-gray-300">
                      <div className="text-xs font-semibold">White's Turn</div>
                      <div className="text-2xl">⚪</div>
                    </div>
                  </div>
                </div>

                {/* Board and badges */}
                <div className="flex flex-col items-center gap-2">
                  <SimpleChessBoard 
                    fen={boardPosition} 
                    onSquareClick={handleSquareClick}
                    selectedSquare={selectedSquare}
                    legalMoves={legalMoves}
                    lastMoveFrom={lastMoveFrom}
                    lastMoveTo={lastMoveTo}
                  />
                  {lastMoveNotation && (
                    <div className="bg-green-100 border-2 border-green-400 px-4 py-2 rounded-lg shadow-md">
                      <span className="text-sm font-semibold text-green-800">
                        ✓ You just played: <span className="font-mono text-xl text-green-900">{lastMoveNotation}</span>
                      </span>
                    </div>
                  )}
                  {selectedSquare && legalMoves.length > 0 && (
                    <div className="bg-blue-100 border-2 border-blue-400 px-4 py-2 rounded-lg">
                      <span className="text-xs text-blue-700">
                        💡 Click a green circle to move • {legalMoves.length} legal move{legalMoves.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
  
            <div className="space-y-2 w-full" style={{ maxWidth: 'min(90%, 500px)' }}>
              {/* Move input and Undo side by side */}
              <div className="flex gap-2">
                <div className="flex-1 flex gap-2">
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
                  onClick={undoLastMove}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 text-sm font-medium flex items-center justify-center gap-1"
                  title="Undo last move (Ctrl+Z or Cmd+Z)"
                >
                  <span>↩️</span> Undo
                </button>
              </div>
              
              {/* Multi-move mode toggle and Get Coaching button */}
              <div className="flex gap-2">
                <button
                  onClick={toggleMultiMoveMode}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    multiMoveMode 
                      ? 'bg-purple-600 text-white hover:bg-purple-700 ring-2 ring-purple-400' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {multiMoveMode ? '🎯 Multi-Move: ON' : 'Multi-Move: OFF'}
                </button>
                {multiMoveMode && (
                  <button
                    onClick={getCoaching}
                    disabled={loading || moveHistory.length === 0}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 text-sm font-medium"
                  >
                    Get Coaching ({moveHistory.length})
                  </button>
                )}
              </div>
              
              {/* Keyboard shortcut hint */}
              <div className="text-[10px] text-gray-500 text-center">
                💡 Tip: Press <kbd className="px-1 py-0.5 bg-gray-200 border border-gray-300 rounded text-gray-700 font-mono">Ctrl+Z</kbd> (or <kbd className="px-1 py-0.5 bg-gray-200 border border-gray-300 rounded text-gray-700 font-mono">⌘Z</kbd> on Mac) to undo
              </div>
  
              <div className="text-xs text-gray-600">
                <p>Phase: <span className="font-semibold capitalize">{gamePhase}</span></p>
              </div>
            </div>
          </div>
  
          {/* Right Side - Coaching Feedback & Chat */}
          <div ref={rightPanelRef} className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
            {/* Coaching Feedback Section - Resizable */}
            <div 
              className="p-4 border-b border-gray-200 flex-shrink-0 overflow-y-auto"
              style={{ height: `${feedbackHeight}%` }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-800">Coach's Feedback</h2>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 font-medium">Coaching:</label>
                  <select
                    value={coachingIntensity}
                    onChange={(e) => setCoachingIntensity(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                {feedback ? (
                  <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">{feedback}</p>
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    Click "New Game" to start, then enter your moves to receive coaching!
                  </p>
                )}
              </div>
            </div>

            {/* Draggable Resize Handle */}
            <div
              onMouseDown={handleMouseDown}
              className={`h-2 bg-gray-300 hover:bg-blue-500 cursor-row-resize flex items-center justify-center transition-colors ${
                isDragging ? 'bg-blue-500' : ''
              }`}
              title="Drag to resize"
            >
              <div className="w-12 h-1 bg-gray-500 rounded-full"></div>
            </div>

            {/* Chat Section - Flexible height */}
            <div 
              className="flex flex-col overflow-hidden min-h-0"
              style={{ height: `${100 - feedbackHeight}%` }}
            >
              <div className="px-4 py-2 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-md font-semibold text-gray-800">💬 Ask Questions</h3>
                <p className="text-xs text-gray-500">Ask follow-up questions about the coaching or position</p>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-0">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-400 italic text-sm mt-4">
                    No questions yet. Ask anything about the coaching or position!
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[85%] rounded-lg px-3 py-2 ${
                          msg.role === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : msg.role === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-white text-gray-800 shadow'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-lg px-3 py-2 shadow">
                      <p className="text-sm text-gray-500">Coach is typing...</p>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-gray-200 flex-shrink-0 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendChatMessage();
                      }
                    }}
                    placeholder="Ask a question..."
                    disabled={chatLoading}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={chatLoading || !chatInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 text-sm font-medium"
                  >
                    Send
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Press Enter to send</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}