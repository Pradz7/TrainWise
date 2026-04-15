from typing import Dict, List
import pandas as pd
from app.models.schemas import UserProfile


ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9,
}


def calculate_bmr(profile: UserProfile) -> float:
    if profile.sex == "male":
        return (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age) + 5
    return (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age) - 161


def calculate_tdee(profile: UserProfile) -> float:
    return calculate_bmr(profile) * ACTIVITY_MULTIPLIERS[profile.activity_level]


def calculate_calories(profile: UserProfile) -> int:
    tdee = calculate_tdee(profile)

    if profile.goal == "fat_loss":
        return int(tdee - 400)
    if profile.goal == "muscle_gain":
        return int(tdee + 250)
    return int(tdee)


def calculate_macros(profile: UserProfile, calories: int) -> Dict[str, int]:
    if profile.goal == "muscle_gain":
        protein_g = int(profile.weight_kg * 2.0)
    elif profile.goal == "fat_loss":
        protein_g = int(profile.weight_kg * 2.2)
    else:
        protein_g = int(profile.weight_kg * 1.8)

    fats_g = int(profile.weight_kg * 0.8)

    protein_cal = protein_g * 4
    fats_cal = fats_g * 9
    remaining_cal = max(calories - (protein_cal + fats_cal), 0)
    carbs_g = int(remaining_cal / 4)

    return {
        "protein_g": protein_g,
        "carbs_g": carbs_g,
        "fats_g": fats_g,
    }


def filter_by_diet(df: pd.DataFrame, diet_preference: str) -> pd.DataFrame:
    if diet_preference == "vegetarian":
        return df[df["diet_type"].isin(["vegetarian", "balanced"])]
    if diet_preference == "vegan":
        return df[df["diet_type"] == "vegan"]
    if diet_preference == "high_protein":
        return df[df["diet_type"].isin(["high_protein", "balanced"])]
    return df


def sort_meals_for_goal(df: pd.DataFrame, goal: str, diet_preference: str) -> pd.DataFrame:
    if diet_preference == "high_protein" or goal == "muscle_gain":
        return df.sort_values(by=["protein", "calories"], ascending=[False, False])

    if goal == "fat_loss":
        return df.sort_values(by=["protein", "calories"], ascending=[False, True])

    return df.sort_values(by=["protein"], ascending=[False])


def pick_top_meal(df: pd.DataFrame, used_names: set[str]) -> dict | None:
    for _, row in df.iterrows():
        if row["food_name"] not in used_names:
            used_names.add(row["food_name"])
            return row.to_dict()
    return None


def suggest_meals(profile: UserProfile, csv_path: str) -> List[dict]:
    df = pd.read_csv(csv_path)

    filtered = filter_by_diet(df, profile.diet_preference)
    ranked = sort_meals_for_goal(filtered, profile.goal, profile.diet_preference)

    used_names: set[str] = set()
    selected: List[dict] = []

    meal_targets = [
        "breakfast",
        "lunch",
        "dinner",
        "snack",
    ]

    for meal_type in meal_targets:
        meal_df = ranked[ranked["meal_type"] == meal_type]
        meal = pick_top_meal(meal_df, used_names)
        if meal:
            selected.append(meal)

    # Add one extra meal based on goal
    if profile.goal == "muscle_gain":
        extra_type = "dinner"
    elif profile.goal == "fat_loss":
        extra_type = "snack"
    else:
        extra_type = "lunch"

    extra_df = ranked[ranked["meal_type"] == extra_type]
    extra_meal = pick_top_meal(extra_df, used_names)
    if extra_meal:
        selected.append(extra_meal)

    return selected