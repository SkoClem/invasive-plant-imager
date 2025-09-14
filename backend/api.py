from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from schemas import Message
from backend import Conversation, Quiz, Utils

router = APIRouter()

@router.post("/api/chat")
def chat(message: Message) -> dict[str, str]:
    print("Message request received")
    try:
        response = conversation.chat_response(message.message)
        return {"text": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
