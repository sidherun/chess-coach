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
    <div className="inline-block border-4 border-gray-800 shadow-lg">
      {ranks.map((rank, rankIndex) => (
        <div key={rank} className="flex">
          {files.map((file, fileIndex) => {
            const square = board[rankIndex][fileIndex];
            const isLight = (rankIndex + fileIndex) % 2 === 0;
            const bgColor = isLight ? 'bg-amber-100' : 'bg-amber-700';
            
            return (
              <div
                key={`${file}${rank}`}
                className={`w-16 h-16 flex items-center justify-center text-5xl ${bgColor} relative`}
              >
                {square && (
                  <span className={square.color === 'w' ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]'}>
                    {pieceSymbols[square.type.toUpperCase()] || pieceSymbols[square.type]}
                  </span>
                )}
                {fileIndex === 0 && (
                  <span className="absolute left-1 top-1 text-xs font-bold opacity-50">
                    {rank}
                  </span>
                )}
                {rankIndex === 7 && (
                  <span className="absolute right-1 bottom-1 text-xs font-bold opacity-50">
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
