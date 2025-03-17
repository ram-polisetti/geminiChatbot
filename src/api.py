import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot import CompanyChatbot
from utils import validate_input

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = Flask(__name__, static_url_path='', static_folder='static')
CORS(app)
logger = logging.getLogger(__name__)

# Initialize chatbot instance
try:
    chatbot = CompanyChatbot()
    logger.info("Chatbot initialized successfully for API")
except Exception as e:
    logger.error(f"Failed to initialize chatbot: {str(e)}")
    raise

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat interactions through API endpoint."""
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({
                'error': 'Invalid request. Message field is required'
            }), 400

        user_message = data['message'].strip()
        
        # Validate input
        if not validate_input(user_message):
            return jsonify({
                'error': 'Invalid input. Please provide a valid question'
            }), 400

        # Generate response using chatbot
        response = chatbot.generate_response(user_message)

        return jsonify({
            'response': response
        })

    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        return jsonify({
            'error': 'Internal server error'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify API status."""
    return jsonify({
        'status': 'healthy',
        'message': 'API is running'
    })

@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 Not Found errors."""
    return jsonify({
        'error': 'Not Found',
        'message': 'The requested URL was not found on the server. If you entered the URL manually please check your spelling and try again.'
    }), 404

@app.route('/', methods=['GET'])
def index():
    """Root endpoint to provide API information."""
    return jsonify({
        'message': 'Welcome to the Company Customer Service Chatbot API',
        'version': '1.0',
        'endpoints': [
            {'path': '/api/chat', 'method': 'POST', 'description': 'Send a message to the chatbot'},
            {'path': '/api/health', 'method': 'GET', 'description': 'Check API health status'}
        ]
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))  # Changed default port from 5000 to 8000
    app.run(host='0.0.0.0', port=port)