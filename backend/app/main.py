from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import profile, nutrition, workout, chat

app = FastAPI(title="TrainWise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile.router, prefix="/profile", tags=["Profile"])
app.include_router(nutrition.router, prefix="/nutrition", tags=["Nutrition"])
app.include_router(workout.router, prefix="/workout", tags=["Workout"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])

@app.get("/")
def root():
    return {"message": "TrainWise API is running"}