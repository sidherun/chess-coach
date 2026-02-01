from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

Base = declarative_base()

class Game(Base):
    __tablename__ = 'games'
    
    id = Column(Integer, primary_key=True)
    pgn = Column(String, nullable=False)  # Stores entire game in PGN format
    result = Column(String)  # "1-0" (white wins), "0-1" (black wins), "1/2-1/2" (draw)
    player_color = Column(String)  # "white" or "black"
    opponent_name = Column(String, default="Friend")
    created_at = Column(DateTime, default=datetime.utcnow)
    final_position_fen = Column(String)  # Final board state
    move_count = Column(Integer, default=0)
    
    def __repr__(self):
        return f"<Game {self.id}: {self.result} as {self.player_color}>"

class CoachingFeedback(Base):
    __tablename__ = 'coaching_feedback'
    
    id = Column(Integer, primary_key=True)
    game_id = Column(Integer, nullable=False)
    move_number = Column(Integer, nullable=False)
    move_san = Column(String, nullable=False)  # Move in standard algebraic notation (e.g., "Nf3")
    position_fen = Column(String, nullable=False)  # Board position after the move
    feedback_text = Column(String, nullable=False)  # Claude's coaching response
    coaching_intensity = Column(String, default="medium")  # low, medium, high
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Feedback Game {self.game_id}, Move {self.move_number}>"

# Database setup
engine = create_engine(os.getenv('DATABASE_URL', 'sqlite:///chess_coach.db'))
SessionLocal = sessionmaker(bind=engine)

def init_db():
    """Initialize the database - creates all tables"""
    Base.metadata.create_all(engine)

def get_db():
    """Get a database session"""
    db = SessionLocal()
    try:
        return db
    finally:
        pass  # Session cleanup handled by caller