import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import directly
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Security Fix #1: Restrict CORS based on environment
flask_env = os.getenv('FLASK_ENV', 'production')
if flask_env == 'development':
    # Development: Allow all origins for local testing
    CORS(app)
else:
    # Production: Restrict to specific origins
    allowed_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
    CORS(app, resources={
        r"/api/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST"],
            "allow_headers": ["Content-Type"]
        }
    })

# Security Fix #2: Set request size limit (1MB)
app.config['MAX_CONTENT_LENGTH'] = 1 * 1024 * 1024

# Initialize database
from app.models.game import init_db
init_db()

# Register routes
from app.routes.game_routes import game_bp
app.register_blueprint(game_bp, url_prefix='/api/game')

# Security Fix #3: Add security headers
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    # Only add HSTS in production with HTTPS
    if flask_env == 'production':
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

@app.route('/health', methods=['GET'])
def health_check():
    return {"status": "healthy", "message": "Chess Coach API is running"}

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    # Security Fix #4: Disable debug mode in production
    debug_mode = flask_env == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)