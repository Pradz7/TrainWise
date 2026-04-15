from typing import List, Dict
import pandas as pd
from app.models.schemas import UserProfile

RELATED_GROUPS = {
    "chest": ["shoulders", "arms"],
    "back": ["arms", "core"],
    "legs": ["core", "shoulders"],
    "shoulders": ["chest", "arms"],
    "arms": ["chest", "back"],
    "core": ["legs", "back"],
}


def pick_exercises(df: pd.DataFrame, muscle_group: str, target_count: int = 4) -> List[Dict]:
    selected = []

    primary = df[df["muscle_group"] == muscle_group]
    for _, row in primary.iterrows():
        selected.append(row.to_dict())
        if len(selected) >= target_count:
            return selected

    for related in RELATED_GROUPS.get(muscle_group, []):
        related_df = df[df["muscle_group"] == related]
        for _, row in related_df.iterrows():
            if row["exercise_name"] not in [e["exercise_name"] for e in selected]:
                selected.append(row.to_dict())
            if len(selected) >= target_count:
                return selected

    for _, row in df.iterrows():
        if row["exercise_name"] not in [e["exercise_name"] for e in selected]:
            selected.append(row.to_dict())
        if len(selected) >= target_count:
            return selected

    return selected


def generate_workout_plan(profile: UserProfile, csv_path: str) -> List[Dict]:
    df = pd.read_csv(csv_path)

    equipment_df = df[df["equipment"] == profile.equipment]
    if equipment_df.empty:
        equipment_df = df

    goal_df = equipment_df[equipment_df["goal"].isin([profile.goal, "maintenance"])]
    if goal_df.empty:
        goal_df = equipment_df

    muscle_groups = ["chest", "back", "legs", "shoulders", "arms", "core"]
    selected_days = []

    days = min(profile.training_days, 6)

    for i in range(days):
        muscle_group = muscle_groups[i % len(muscle_groups)]
        exercises = pick_exercises(goal_df, muscle_group, target_count=4)

        selected_days.append({
            "day": f"Day {i + 1}",
            "focus": muscle_group.title(),
            "exercises": exercises
        })

    return selected_days