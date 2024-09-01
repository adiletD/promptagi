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

from inference.lllm_endpoints import promptGroq

@app.route('/healthcheck-inference')
def healthcheck_inference():
    logger.info("Health check inference requested")
    try:
        # Example prompt and system prompt for health check
        prompt = "This is a health check prompt."
        system_prompt = "System prompt for health check."
        response = promptGroq(prompt, system_prompt)
        return jsonify({"status": "healthy", "response": response})
    except Exception as e:
        logger.error(f"Health check inference failed: {str(e)}")
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

@app.route('/')
def hello():
    return jsonify({"message": "Hello from Flask!"})



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)