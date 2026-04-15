from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import get_chat_reply

router = APIRouter()


@router.post("/", response_model=ChatResponse)
def chat_with_trainwise(payload: ChatRequest):
    reply = get_chat_reply(payload.profile, payload.user_message, payload.history)
    return ChatResponse(reply=reply)