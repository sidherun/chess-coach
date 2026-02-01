import { Chess } from 'chess.js';

const pieceSymbols = {
  'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
  'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔'
};

export default function SimpleChessBoard({ fen, onSquareClick, selectedSquare, legalMoves, lastMoveFrom, lastMoveTo }) {
  const game = new Chess(fen);
  const board = game.board();
  
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  
  return (
    <div className="inline-block border-4 border-gray-800 shadow-xl rounded">
      {ranks.map((rank, rankIndex) => (
        <div key={rank} className="flex">
          {files.map((file, fileIndex) => {
            const square = board[rankIndex][fileIndex];
            const squareName = `${file}${rank}`;
            const isLight = (rankIndex + fileIndex) % 2 === 0;
            const bgColor = isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]';
            
            // Determine if this square should be highlighted
            const isSelected = squareName === selectedSquare;
            const isLegalMove = legalMoves?.includes(squareName);
            const isLastMoveFrom = squareName === lastMoveFrom;
            const isLastMoveTo = squareName === lastMoveTo;
            
            // Build highlight classes
            let highlightClass = '';
            if (isSelected) {
              highlightClass = 'ring-4 ring-blue-500 ring-inset';
            } else if (isLastMoveFrom) {
              highlightClass = 'ring-4 ring-yellow-400 ring-inset';
            } else if (isLastMoveTo) {
              highlightClass = 'ring-4 ring-green-400 ring-inset';
            }
            
            return (
              <div
                key={squareName}
                onClick={() => onSquareClick(squareName)}
                className={`w-16 h-16 flex items-center justify-center text-5xl ${bgColor} ${highlightClass} relative cursor-pointer hover:opacity-80 transition-opacity`}
              >
                {/* Legal move indicator (green dot) */}
                {isLegalMove && !square && (
                  <div className="absolute w-4 h-4 bg-green-500 rounded-full opacity-60 z-10"></div>
                )}
                {isLegalMove && square && (
                  <div className="absolute inset-0 border-4 border-green-500 rounded-full opacity-50 z-10"></div>
                )}
                
                {/* Piece */}
                {square && (
                  <span 
                    className="font-bold absolute z-20"
                    style={{
                      color: square.color === 'w' ? '#ffffff' : '#000000',
                      textShadow: square.color === 'w' 
                        ? '0 0 4px #000, 0 0 8px #000, 0 2px 4px rgba(0,0,0,0.9), 2px 2px 0px #000, -2px -2px 0px #000'
                        : '0 0 3px #fff, 0 0 6px #fff, 0 1px 2px rgba(255,255,255,0.8), 1px 1px 0px #fff, -1px -1px 0px #fff'
                    }}
                  >
                    {square.color === 'w' ? pieceSymbols[square.type.toUpperCase()] : pieceSymbols[square.type]}
                  </span>
                )}
                
                {/* Square coordinate label - always visible */}
                <span 
                  className={`absolute text-[11px] font-bold z-0 ${
                    isLight ? 'text-[#b58863]' : 'text-[#f0d9b5]'
                  }`}
                  style={{
                    bottom: '2px',
                    right: '3px',
                    opacity: 0.7
                  }}
                >
                  {squareName}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
