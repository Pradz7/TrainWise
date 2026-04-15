export type UserProfile = {
  name: string;
  age: number;
  sex: "male" | "female";
  weight_kg: number;
  height_cm: number;
  goal: "fat_loss" | "muscle_gain" | "maintenance";
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active";
  diet_preference: "balanced" | "high_protein" | "vegetarian" | "vegan";
  equipment: "bodyweight" | "dumbbells" | "full_gym";
  training_days: number;
};

export type NutritionPlan = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  meals: {
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    diet_type: string;
    meal_type: string;
  }[];
};

export type WorkoutExercise = {
  exercise_name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  goal: string;
  instructions: string;
};

export type WorkoutDay = {
  day: string;
  focus: string;
  exercises: WorkoutExercise[];
};

export type WorkoutPlan = {
  goal: string;
  equipment: string;
  training_days: number;
  plan: WorkoutDay[];
};