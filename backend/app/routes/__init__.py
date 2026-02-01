from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    # Enable CORS so frontend can talk to backend
    CORS(app)
    
    # Initialize database BEFORE importing routes
    from app.models.game import init_db
    init_db()
    
    # Import and register blueprints INSIDE create_app to avoid circular imports
    from app.routes.game_routes import game_bp
    app.register_blueprint(game_bp, url_prefix='/api/game')
    
    @app.route('/health', methods=['GET'])
    def health_check():
        return {"status": "healthy", "message": "Chess Coach API is running"}
    
    return app