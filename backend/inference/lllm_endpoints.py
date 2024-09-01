import json
import os
import time
from flask import Flask, request, jsonify
from .groq_client import GroqClient
# import openai
# from openai import OpenAI
# import llm_functions

# from packaging import version

# import replicate

groq_client = GroqClient()

def promptGroq(prompt, system_prompt):
  completion = groq_client.run_chat_completion(prompt, system_prompt)
  return completion

def promptGroqJson( prompt, system_prompt, jsonFormatDefClass):
  completion = groq_client.run_chat_completion_json_mode(jsonFormatDefClass, prompt, system_prompt)
  return completion