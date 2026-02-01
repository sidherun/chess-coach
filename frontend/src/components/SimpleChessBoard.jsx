import { Chess } from 'chess.js';

const pieceSymbols = {
  'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
  'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔'
};

export default function SimpleChessBoard({ fen }) {
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
            const isLight = (rankIndex + fileIndex) % 2 === 0;
            // Professional chess board colors
            const bgColor = isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]';
            
            return (
              <div
                key={`${file}${rank}`}
                className={`w-16 h-16 flex items-center justify-center text-5xl ${bgColor} relative`}
              >
                {square && (
                  <span 
                    className="font-bold"
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
                {fileIndex === 0 && (
                  <span className={`absolute left-1 top-0.5 text-[10px] font-bold ${isLight ? 'text-[#b58863]' : 'text-[#f0d9b5]'}`}>
                    {rank}
                  </span>
                )}
                {rankIndex === 7 && (
                  <span className={`absolute right-1 bottom-0 text-[10px] font-bold ${isLight ? 'text-[#b58863]' : 'text-[#f0d9b5]'}`}>
                    {file}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
