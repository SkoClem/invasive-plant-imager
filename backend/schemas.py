from enum import Enum
from typing import Union
from pydantic import BaseModel

class Message(BaseModel):
    message: str

class CreationMethod(str, Enum):
    AI_CHAT = "ai_chat"
    PDF = "pdf"
    VIDEO = "video"

class QuizType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    FREE_RESPONSE = "free_response"
    PASSAGE_ANALYSIS = "passage_analysis"

class QuizRequest(BaseModel):
    creation_method: CreationMethod
    quiz_type: QuizType
    data: Union[str, bytes]
