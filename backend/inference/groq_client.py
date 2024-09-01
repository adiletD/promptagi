import os
from groq import Groq
import logging
import json
# from pydantic import BaseModel
# from cv import CV
from typing import List
from dotenv import load_dotenv  # Add this import

load_dotenv() 

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO)
# set higher logging level for httpx to avoid all GET and POST requests being logged
logging.getLogger("httpx").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

# Replace single API key with a single API key
api_key = os.environ['GROQ_API_KEY']

# class CVAnalysisResult(BaseModel):
#     strengths: str
#     areas_for_improvement: str
#     suggestions: str
#     sample_perfect_additional_bullet_points: str


class GroqClient:

    def __init__(self):
        self.client = Groq(api_key=api_key)

    def run_chat_completion(self,
                            prompt,
                            system_prompt,
                            model="llama-3.1-70b-versatile"):
        logger.info("start of the inference")
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=model,
            )
            logger.info("end of the inference")
            return chat_completion.choices[0].message.content
        except Exception as e:
            logger.error(f"API key failed: {str(e)}")
            raise Exception("Unable to complete the request with the available API key")

    def run_chat_completion_json_mode(self,
                                      jsonFormatDefClass,
                                      prompt,
                                      system_prompt,
                                      model="llama-3.1-70b-versatile"):
        logger.info("start of the inference")
        system_prompt = system_prompt + f"\n The JSON object must use the schema: {json.dumps(jsonFormatDefClass.model_json_schema(), indent=2)}"
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=model,
                response_format={
                    "type": "json_object"
                }
            )
            logger.info("end of the inference")
            return chat_completion.choices[0].message.content
        except Exception as e:
            logger.error(f"API key failed: {str(e)}")
            raise Exception("Unable to complete the request with the available API key")