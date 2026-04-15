from pathlib import Path
from fastapi import APIRouter
from app.models.schemas import UserProfile
from app.services.workout_service import generate_workout_plan

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent
EXERCISES_CSV = BASE_DIR / "data" / "exercises.csv"


@router.post("/plan")
def get_workout_plan(profile: UserProfile):
    plan = generate_workout_plan(profile, str(EXERCISES_CSV))

    return {
        "goal": profile.goal,
        "equipment": profile.equipment,
        "training_days": profile.training_days,
        "plan": plan,
    }