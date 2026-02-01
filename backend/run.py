import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import directly
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Initialize database
from app.models.game import init_db
init_db()

# Register routes
from app.routes.game_routes import game_bp
app.register_blueprint(game_bp, url_prefix='/api/game')

@app.route('/health', methods=['GET'])
def health_check():
    return {"status": "healthy", "message": "Chess Coach API is running"}

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)