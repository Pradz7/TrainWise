from typing import List, Literal
from pydantic import BaseModel, Field


GoalType = Literal["fat_loss", "muscle_gain", "maintenance"]
SexType = Literal["male", "female"]
ActivityType = Literal["sedentary", "light", "moderate", "active", "very_active"]
DietType = Literal["balanced", "high_protein", "vegetarian", "vegan"]
EquipmentType = Literal["bodyweight", "dumbbells", "full_gym"]


class UserProfile(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    age: int = Field(..., ge=13, le=80)
    sex: SexType
    weight_kg: float = Field(..., gt=20, le=300)
    height_cm: float = Field(..., gt=100, le=250)
    goal: GoalType
    activity_level: ActivityType
    diet_preference: DietType
    equipment: EquipmentType
    training_days: int = Field(..., ge=2, le=7)


class NutritionPlan(BaseModel):
    calories: int
    protein_g: int
    carbs_g: int
    fats_g: int
    meals: List[dict]


class WorkoutPlan(BaseModel):
    goal: str
    equipment: str
    training_days: int
    plan: List[dict]


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    profile: UserProfile
    user_message: str
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str