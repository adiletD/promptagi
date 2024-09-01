from flask import Flask, jsonify, request
from flask_cors import CORS
import logging

from pydantic import ValidationError
from models import EnhancePromptRequest, EnhancePromptResponse, Question

from inference.system_prompts import sys_prompt_v1
from inference import llm_endpoints
import json

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.route('/healthcheck')
def healthcheck():
    logger.info("Health check requested")
    return jsonify({"status": "healthy"})

@app.route('/healthcheck-inference')
def healthcheck_inference():
    logger.info("Health check inference requested")
    try:
        # Example prompt and system prompt for health check
        prompt = "This is a health check prompt."
        system_prompt = "System prompt for health check."
        response = llm_endpoints.promptGroq(prompt, system_prompt)
        return jsonify({"status": "healthy", "response": response})
    except Exception as e:
        logger.error(f"Health check inference failed: {str(e)}")
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

@app.route('/enhance-prompt-v1', methods=['POST'])
def enhance_prompt_v1():
    try:
        data = request.json
        request_data = EnhancePromptRequest(**data)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

    current_sys_prompt = request_data.currentSysPrompt
    previous_sys_prompt = request_data.previousSysPrompt
    questions = request_data.questions


    prompt = f"\n Input: {json.dumps(request_data.dict(), indent=2)}"
    
    logger.info(f"Prompt: {prompt}")

    # Convert questions list to a string
    # questions_str = ", ".join(questions)

    # prompt = f"prompt: {current_sys_prompt} previous_sys_prompt: {previous_sys_prompt} questions: {questions_str}"

    response_json = llm_endpoints.promptGroqJson(prompt, sys_prompt_v1.prompt, EnhancePromptResponse)
    response_data = EnhancePromptResponse(**json.loads(response_json))

    new_sys_prompt = f"Enhanced: {response_data.newSysPrompt}"
    new_questions = f"New Qs: {response_data.questions}"   # In a real scenario, you would modify the questions as needed

    logger.info(f"New sys prompt: {new_sys_prompt} . New questions: {new_questions}")

    return jsonify(response_data.dict())

@app.route('/')
def hello():
    return jsonify({"message": "Hello from Flask!"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)