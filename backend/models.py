from pydantic import BaseModel
from typing import List

class Question(BaseModel):
    question: str
    choices: List[str]
    answer: str

class EnhancePromptRequest(BaseModel):
    currentSysPrompt: str
    previousSysPrompt: str
    questions: List[Question]

class EnhancePromptResponse(BaseModel):
    newSysPrompt: str
    questions: List[Question]