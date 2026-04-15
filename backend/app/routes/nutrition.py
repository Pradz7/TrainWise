from pathlib import Path
from fastapi import APIRouter
from app.models.schemas import UserProfile
from app.services.nutrition_service import (
    calculate_calories,
    calculate_macros,
    suggest_meals,
)

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent
FOODS_CSV = BASE_DIR / "data" / "foods.csv"


@router.post("/plan")
def get_nutrition_plan(profile: UserProfile):
    calories = calculate_calories(profile)
    macros = calculate_macros(profile, calories)
    meals = suggest_meals(profile, str(FOODS_CSV))

    return {
        "calories": calories,
        "protein_g": macros["protein_g"],
        "carbs_g": macros["carbs_g"],
        "fats_g": macros["fats_g"],
        "meals": meals,
    }