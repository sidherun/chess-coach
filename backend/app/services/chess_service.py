import chess
import chess.pgn
from io import StringIO
from datetime import datetime

class ChessService:
    def __init__(self):
        self.board = chess.Board()
        self.moves = []  # List of moves in SAN notation
        
    def reset_board(self):
        """Start a new game"""
        self.board = chess.Board()
        self.moves = []
        
    def make_move(self, move_str):
        """
        Make a move on the board
        
        Args:
            move_str: Move in SAN (e.g., "e4", "Nf3") or UCI (e.g., "e2e4")
        
        Returns:
            dict with move info or error
        """
        try:
            # Try parsing as SAN first
            move = self.board.parse_san(move_str)
            
            # Get SAN notation BEFORE pushing (board state matters for SAN)
            san_move = self.board.san(move)
            
            # Now push the move
            self.board.push(move)
            self.moves.append(san_move)
            
            return {
                "success": True,
                "move": san_move,
                "fen": self.board.fen(),
                "is_checkmate": self.board.is_checkmate(),
                "is_check": self.board.is_check(),
                "is_stalemate": self.board.is_stalemate(),
                "is_game_over": self.board.is_game_over(),
                "legal_moves": [self.board.san(m) for m in self.board.legal_moves]
            }
        except ValueError as e:
            return {
                "success": False,
                "error": f"Invalid move: {move_str}. Error: {str(e)}",
                "legal_moves": [self.board.san(m) for m in self.board.legal_moves]
            }
    
    def get_board_state(self):
        """Get current board state"""
        return {
            "fen": self.board.fen(),
            "turn": "white" if self.board.turn else "black",
            "move_number": len(self.moves),
            "moves": self.moves,
            "is_check": self.board.is_check(),
            "is_checkmate": self.board.is_checkmate(),
            "is_stalemate": self.board.is_stalemate(),
            "is_game_over": self.board.is_game_over()
        }
    
    def get_pgn(self):
        """Export game as PGN string"""
        game = chess.pgn.Game()
        game.headers["Event"] = "Chess Coach Training"
        game.headers["Date"] = datetime.now().strftime("%Y.%m.%d")
        
        node = game
        temp_board = chess.Board()
        
        for move_san in self.moves:
            move = temp_board.parse_san(move_san)
            node = node.add_variation(move)
            temp_board.push(move)
        
        exporter = chess.pgn.StringExporter(headers=True, variations=True, comments=True)
        return game.accept(exporter)
    
    def load_from_fen(self, fen):
        """Load a specific board position"""
        try:
            self.board = chess.Board(fen)
            return {"success": True, "fen": fen}
        except ValueError as e:
            return {"success": False, "error": str(e)}
    
    def get_game_phase(self):
        """Determine if we're in opening, middlegame, or endgame"""
        move_count = len(self.moves)
        piece_count = len(self.board.piece_map())
        
        if move_count < 10:
            return "opening"
        elif piece_count <= 12:  # Few pieces left
            return "endgame"
        else:
            return "middlegame"
    
    def undo_last_move(self):
        """
        Undo the last move made
        
        Returns:
            dict with success status and new board state
        """
        if len(self.moves) == 0:
            return {
                "success": False,
                "error": "No moves to undo"
            }
        
        try:
            # Pop the last move from python-chess board
            self.board.pop()
            # Remove last move from our tracking list
            undone_move = self.moves.pop()
            
            return {
                "success": True,
                "undone_move": undone_move,
                "fen": self.board.fen(),
                "move_count": len(self.moves),
                "message": f"Undid move: {undone_move}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Could not undo move: {str(e)}"
            }
