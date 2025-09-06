from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from app.schemas import Message, MCQuizFromChat, QuizRequest, CreationMethod, QuizType
from app.backend import Conversation, Quiz, Utils

router = APIRouter()
conversation = Conversation()
quiz = Quiz()
utils = Utils()

@router.post("/api/chat")
def chat(message: Message) -> dict[str, str]:
    print("Message request received")
    try:
        response = conversation.chat_response(message.message)
        return {"text": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/generate_quiz")
async def generate_quiz(request: QuizRequest):
    try:
        if request.creation_method == CreationMethod.AI_CHAT:
            if request.quiz_type == QuizType.MULTIPLE_CHOICE:
                return await _ai_chat_mc_quiz(request.data)
            elif request.quiz_type == QuizType.FREE_RESPONSE:
                # TODO: implement
                return {"status": "free_response quiz not implemented yet"}
            elif request.quiz_type == QuizType.PASSAGE_ANALYSIS:
                # TODO: implement
                return {"status": "passage_analysis quiz not implemented yet"}
            else:
                raise HTTPException(status_code=400, detail="Invalid quiz type")

        elif request.creation_method == CreationMethod.PDF:
            # TODO: implement PDF quiz generation
            return {"status": "PDF quiz not implemented yet"}

        elif request.creation_method == CreationMethod.VIDEO:
            # TODO: implement video quiz generation
            return {"status": "Video quiz not implemented yet"}

        else:
            raise HTTPException(status_code=400, detail="Invalid creation method")

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

async def _ai_chat_mc_quiz(text: str) -> Dict[int, Dict[str, Any]]:
    chat_details = conversation.chat_summary(chat_log=text)
    raw_quiz = quiz.multiple_choice_from_chat(summary=chat_details)
    quiz_json = utils.raw_quiz_to_json(raw_quiz=raw_quiz)
    return quiz_json
