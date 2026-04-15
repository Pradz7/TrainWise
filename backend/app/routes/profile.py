from fastapi import APIRouter
from app.models.schemas import UserProfile

router = APIRouter()


@router.post("/create")
def create_profile(profile: UserProfile):
    return {
        "message": "Profile received successfully",
        "profile": profile.dict()
    }