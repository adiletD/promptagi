from flask import Flask, jsonify
from flask_cors import CORS

import logging
app = Flask(__name__)
CORS(app) 

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.route('/healthcheck')
def healthcheck():
    logger.info("Health check requested")
    return jsonify({"status": "healthy"})

@app.route('/')
def hello():
    return jsonify({"message": "Hello from Flask!"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)