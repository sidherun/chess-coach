from flask import Blueprint, request, jsonify
from app.services.chess_service import ChessService
from app.services.claude_service import ClaudeCoachingService
from app.models.game import Game, CoachingFeedback, get_db, init_db

# Create blueprint
game_bp = Blueprint('game', __name__)

# Initialize services immediately (they persist across requests)
chess_service = ChessService()
claude_service = ClaudeCoachingService()

@game_bp.route('/new', methods=['POST'])
def new_game():
    """Start a new chess game"""
    
    data = request.get_json()
    player_color = data.get('player_color', 'white')
    opponent_name = data.get('opponent_name', 'Friend')
    
    # Reset the chess board
    chess_service.reset_board()
    
    return jsonify({
        "success": True,
        "message": f"New game started. You are playing as {player_color}.",
        "board_state": chess_service.get_board_state()
    })

@game_bp.route('/move', methods=['POST'])
def make_move():
    """
    Make a move and get coaching feedback
    
    Expected JSON:
    {
        "move": "e4",
        "coaching_intensity": "medium",  # optional
        "player_elo": 800  # optional
    }
    """
    
    data = request.get_json()
    move_str = data.get('move')
    coaching_intensity = data.get('coaching_intensity', 'medium')
    player_elo = data.get('player_elo', 800)
    
    if not move_str:
        return jsonify({"success": False, "error": "No move provided"}), 400
    
    # Make the move
    result = chess_service.make_move(move_str)
    
    if not result['success']:
        return jsonify(result), 400
    
    # Get coaching feedback
    game_phase = chess_service.get_game_phase()
    move_history = chess_service.moves
    
    feedback = claude_service.get_coaching_feedback(
        move_san=result['move'],
        fen=result['fen'],
        game_phase=game_phase,
        player_elo=player_elo,
        coaching_intensity=coaching_intensity,
        move_history=move_history
    )
    
    return jsonify({
        "success": True,
        "move": result['move'],
        "board_state": chess_service.get_board_state(),
        "coaching_feedback": feedback,
        "game_phase": game_phase,
        "is_check": result['is_check'],
        "is_checkmate": result['is_checkmate'],
        "is_game_over": result['is_game_over']
    })

@game_bp.route('/batch-moves', methods=['POST'])
def batch_moves():
    """
    Submit multiple moves at once, then get analysis
    
    Expected JSON:
    {
        "moves": ["e4", "e5", "Nf3", "Nc6"],
        "analyze_move": 2,  # Which move to analyze (1-indexed)
        "player_elo": 800
    }
    """
    
    data = request.get_json()
    moves = data.get('moves', [])
    analyze_move_num = data.get('analyze_move')
    player_elo = data.get('player_elo', 800)
    
    if not moves:
        return jsonify({"success": False, "error": "No moves provided"}), 400
    
    results = []
    for move in moves:
        result = chess_service.make_move(move)
        if not result['success']:
            return jsonify({
                "success": False,
                "error": f"Invalid move: {move}",
                "results": results
            }), 400
        results.append(result)
    
    # If specific move analysis requested
    feedback = None
    if analyze_move_num and 1 <= analyze_move_num <= len(moves):
        idx = analyze_move_num - 1
        game_phase = chess_service.get_game_phase()
        feedback = claude_service.get_coaching_feedback(
            move_san=chess_service.moves[idx],
            fen=results[idx]['fen'],
            game_phase=game_phase,
            player_elo=player_elo,
            coaching_intensity="high",  # Detailed for batch analysis
            move_history=chess_service.moves[:idx+1]
        )
    
    return jsonify({
        "success": True,
        "moves_played": len(moves),
        "board_state": chess_service.get_board_state(),
        "coaching_feedback": feedback
    })

@game_bp.route('/state', methods=['GET'])
def get_state():
    """Get current board state"""
    
    return jsonify({
        "success": True,
        "board_state": chess_service.get_board_state(),
        "game_phase": chess_service.get_game_phase()
    })

@game_bp.route('/save', methods=['POST'])
def save_game():
    """
    Save the current game to database
    
    Expected JSON:
    {
        "result": "1-0",  # or "0-1" or "1/2-1/2"
        "player_color": "white",
        "opponent_name": "Friend"
    }
    """
    
    data = request.get_json()
    result = data.get('result')
    player_color = data.get('player_color', 'white')
    opponent_name = data.get('opponent_name', 'Friend')
    
    if not result:
        return jsonify({"success": False, "error": "Game result required"}), 400
    
    # Get PGN and final position
    pgn = chess_service.get_pgn()
    final_fen = chess_service.board.fen()
    move_count = len(chess_service.moves)
    
    # Save to database
    db = get_db()
    try:
        game = Game(
            pgn=pgn,
            result=result,
            player_color=player_color,
            opponent_name=opponent_name,
            final_position_fen=final_fen,
            move_count=move_count
        )
        db.add(game)
        db.commit()
        
        game_id = game.id
        db.close()
        
        return jsonify({
            "success": True,
            "message": "Game saved successfully",
            "game_id": game_id
        })
    except Exception as e:
        db.rollback()
        db.close()
        return jsonify({"success": False, "error": str(e)}), 500

@game_bp.route('/games', methods=['GET'])
def get_games():
    """Get all saved games"""
    db = get_db()
    try:
        games = db.query(Game).order_by(Game.created_at.desc()).all()
        
        games_list = [{
            "id": game.id,
            "result": game.result,
            "player_color": game.player_color,
            "opponent_name": game.opponent_name,
            "move_count": game.move_count,
            "created_at": game.created_at.isoformat()
        } for game in games]
        
        db.close()
        
        return jsonify({
            "success": True,
            "games": games_list
        })
    except Exception as e:
        db.close()
        return jsonify({"success": False, "error": str(e)}), 500

@game_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get win/loss/draw statistics"""
    db = get_db()
    try:
        games = db.query(Game).all()
        
        wins = sum(1 for g in games if g.result == "1-0" and g.player_color == "white" or 
                                        g.result == "0-1" and g.player_color == "black")
        losses = sum(1 for g in games if g.result == "0-1" and g.player_color == "white" or 
                                          g.result == "1-0" and g.player_color == "black")
        draws = sum(1 for g in games if g.result == "1/2-1/2")
        
        db.close()
        
        return jsonify({
            "success": True,
            "stats": {
                "total_games": len(games),
                "wins": wins,
                "losses": losses,
                "draws": draws,
                "win_rate": round(wins / len(games) * 100, 1) if games else 0
            }
        })
    except Exception as e:
        db.close()
        return jsonify({"success": False, "error": str(e)}), 500

@game_bp.route('/coaching-intensity', methods=['POST'])
def set_coaching_intensity():
    """
    Update coaching intensity preference
    
    Expected JSON:
    {
        "intensity": "low"  # or "medium" or "high"
    }
    """
    data = request.get_json()
    intensity = data.get('intensity', 'medium')
    
    if intensity not in ['low', 'medium', 'high']:
        return jsonify({"success": False, "error": "Invalid intensity level"}), 400
    
    # In a future version, this could save to user preferences
    # For now, just acknowledge
    return jsonify({
        "success": True,
        "message": f"Coaching intensity set to {intensity}"
    })

@game_bp.route('/undo', methods=['POST'])
def undo_move():
    """
    Undo the last move made
    
    Returns:
        Updated board state after undoing the move
    """
    result = chess_service.undo_last_move()
    
    if not result['success']:
        return jsonify(result), 400
    
    return jsonify({
        "success": True,
        "message": result['message'],
        "undone_move": result['undone_move'],
        "board_state": chess_service.get_board_state(),
        "game_phase": chess_service.get_game_phase()
    })

@game_bp.route('/chat', methods=['POST'])
def chat():
    """
    Ask a follow-up question about the coaching or game state
    
    Expected JSON:
    {
        "question": "Why was e4 a good move?",
        "recent_coaching": "e4 is a strong opening move...",  # optional
        "player_elo": 800  # optional
    }
    """
    data = request.get_json()
    question = data.get('question')
    recent_coaching = data.get('recent_coaching', '')
    player_elo = data.get('player_elo', 800)
    
    if not question:
        return jsonify({"success": False, "error": "No question provided"}), 400
    
    # Get current game context
    game_phase = chess_service.get_game_phase()
    move_history = chess_service.moves
    fen = chess_service.board.fen()
    
    # Get AI response using Claude service
    response = claude_service.answer_question(
        question=question,
        fen=fen,
        game_phase=game_phase,
        move_history=move_history,
        recent_coaching=recent_coaching,
        player_elo=player_elo
    )
    
    return jsonify({
        "success": True,
        "answer": response
    })