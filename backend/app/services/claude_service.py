import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

class ClaudeCoachingService:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        self.model = "claude-sonnet-4-20250514"
        
    def get_coaching_feedback(self, move_san, fen, game_phase, player_elo=800, 
                              coaching_intensity="medium", move_history=None):
        """
        Get coaching feedback from Claude for a specific move
        
        Args:
            move_san: The move in standard algebraic notation (e.g., "Nf3")
            fen: Current board position in FEN notation
            game_phase: "opening", "middlegame", or "endgame"
            player_elo: Current player rating (default 800)
            coaching_intensity: "low", "medium", "high"
            move_history: List of previous moves (optional)
        
        Returns:
            Coaching feedback text from Claude
        """
        
        # Build context-aware prompt
        intensity_guidance = {
            "low": "Give brief, encouraging feedback. Focus on one key point.",
            "medium": "Provide balanced feedback with strategic insights and one or two tactical points.",
            "high": "Give detailed analysis including strategic themes, tactical opportunities, and alternative moves."
        }
        
        elo_guidance = self._get_elo_appropriate_guidance(player_elo)
        
        prompt = f"""You are a patient, encouraging chess coach working with a player rated {player_elo} ELO who wants to improve to 1500+.

Game Phase: {game_phase}
Move Played: {move_san}
Current Position (FEN): {fen}
{f"Move History: {' '.join(move_history)}" if move_history else ""}

Coaching Intensity: {intensity_guidance[coaching_intensity]}

{elo_guidance}

Provide coaching feedback on this move. Consider:
1. Was this move sound? Why or why not?
2. What strategic or tactical ideas does it support or miss?
3. In the context of {game_phase}, what should the player be thinking about?
4. {f"Given they're rated {player_elo}, focus on concepts appropriate to their level." if player_elo < 1200 else ""}

Keep your response conversational and encouraging. End with a specific question or observation to help them think about the next move."""

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            return message.content[0].text
            
        except Exception as e:
            return f"Error getting coaching feedback: {str(e)}"
    
    def _get_elo_appropriate_guidance(self, elo):
        """Provide coaching guidance appropriate to player's level"""
        if elo < 1000:
            return """Focus on:
- Basic tactical patterns (forks, pins, skewers)
- Piece development principles
- King safety
- Avoiding one-move blunders
Keep explanations simple and concrete."""
        elif elo < 1200:
            return """Focus on:
- Tactical awareness and pattern recognition
- Opening principles (control center, develop pieces, castle early)
- Basic endgame patterns
- Calculating 2-3 moves ahead"""
        else:
            return """Focus on:
- Strategic planning and pawn structures
- Advanced tactical combinations
- Positional understanding
- Opening repertoire development"""
    
    def analyze_game(self, pgn, result, player_color, player_elo=800):
        """
        Analyze a completed game and provide summary feedback
        
        Args:
            pgn: Game in PGN format
            result: Game result ("1-0", "0-1", "1/2-1/2")
            player_color: "white" or "black"
            player_elo: Player's rating
        
        Returns:
            Game analysis and improvement suggestions
        """
        
        prompt = f"""You are a chess coach analyzing a game for a {player_elo} ELO player who played as {player_color}.

Game Result: {result}
PGN:
{pgn}

Provide a post-game analysis covering:
1. Overall game assessment - what went well, what didn't
2. Key moments or turning points
3. 2-3 specific areas for improvement based on this game
4. One concrete practice suggestion to work on for next game

Keep the tone encouraging and constructive."""

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=2048,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            return message.content[0].text
            
        except Exception as e:
            return f"Error analyzing game: {str(e)}"
    
    def answer_question(self, question, fen, game_phase, move_history=None, 
                       recent_coaching="", player_elo=800):
        """
        Answer a follow-up question about the game or coaching
        
        Args:
            question: Player's question
            fen: Current board position
            game_phase: Current game phase
            move_history: List of moves
            recent_coaching: Most recent coaching feedback
            player_elo: Player's rating
        
        Returns:
            Answer to the question
        """
        
        elo_guidance = self._get_elo_appropriate_guidance(player_elo)
        
        prompt = f"""You are a patient chess coach having a conversation with a {player_elo} ELO player.

Current Game Context:
- Phase: {game_phase}
- Position (FEN): {fen}
{f"- Move History: {' '.join(move_history)}" if move_history else ""}
{f"- Recent Coaching: {recent_coaching}" if recent_coaching else ""}

Player's Question: "{question}"

{elo_guidance}

Answer their question in a clear, encouraging way. Use the current game context to make your explanation concrete and relevant. If the question relates to the current position, reference specific pieces or squares. Keep your response conversational and helpful."""

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            return message.content[0].text
            
        except Exception as e:
            return f"Error answering question: {str(e)}"