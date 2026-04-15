import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from app.models.schemas import UserProfile, ChatMessage

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key and api_key.strip() else None


def build_prompt(profile: UserProfile, user_message: str, history: list[ChatMessage]) -> str:
    history_text = "\n".join(
        [f"{msg.role.upper()}: {msg.content}" for msg in history[-8:]]
    )

    return f"""
You are TrainWise, an AI fitness and nutrition coach.

User profile:
- Name: {profile.name}
- Age: {profile.age}
- Sex: {profile.sex}
- Weight: {profile.weight_kg} kg
- Height: {profile.height_cm} cm
- Goal: {profile.goal}
- Activity level: {profile.activity_level}
- Diet preference: {profile.diet_preference}
- Equipment: {profile.equipment}
- Training days per week: {profile.training_days}

Rules:
- Be conversational, warm, and practical.
- Reply like a chatbot, not like a long article.
- Keep answers concise unless the user asks for detail.
- Use short paragraphs or bullets only when helpful.
- Do not use markdown headings like # or ##.
- Do not use **bold** or *italics*.
- Do not diagnose injuries or diseases.

Recent conversation:
{history_text}

User:
{user_message}
"""


def fallback_reply(profile: UserProfile, user_message: str) -> str:
    msg = user_message.lower()

    if "breakfast" in msg:
        return "Try Greek yogurt with oats, banana, and nuts. It is simple, high in protein, and good for muscle gain."
    if "post-workout" in msg:
        return "A good post-workout meal is chicken with rice and vegetables, or a protein smoothie with banana and milk."
    if "gain weight" in msg or "muscle" in msg:
        return f"For muscle gain, aim for a calorie surplus, hit your protein target, and train consistently {profile.training_days} days per week."
    if "fat loss" in msg or "lose weight" in msg:
        return "For fat loss, keep calories controlled, eat high-protein meals, and stay consistent with training and daily activity."

    return f"TrainWise tip: stay consistent with training, hit your protein target, and make the most of your {profile.equipment} setup."


def get_chat_reply(profile: UserProfile, user_message: str, history: list[ChatMessage]) -> str:
    if client is None:
        return fallback_reply(profile, user_message)

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=build_prompt(profile, user_message, history),
        )

        if hasattr(response, "text") and response.text:
            return response.text.strip()

        return fallback_reply(profile, user_message)

    except Exception as e:
        error_text = str(e)

        if "429" in error_text or "RESOURCE_EXHAUSTED" in error_text:
            return fallback_reply(profile, user_message)

        if "503" in error_text or "UNAVAILABLE" in error_text:
            return "TrainWise is a bit busy right now. Please try again in a moment."

        return fallback_reply(profile, user_message)