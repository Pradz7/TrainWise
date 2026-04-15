"use client";

import { useEffect, useState } from "react";
import ProfileForm from "@/components/ProfileForm";
import NutritionCard from "@/components/NutritionCard";
import WorkoutCard from "@/components/WorkoutCard";
import ChatBox from "@/components/ChatBox";
import StatsCard from "@/components/StatsCard";
import Toast from "@/components/Toast";
import { NutritionPlan, UserProfile, WorkoutPlan } from "@/types";

const defaultProfile: UserProfile = {
  name: "",
  age: 18,
  sex: "male",
  weight_kg: 50,
  height_cm: 170,
  goal: "maintenance",
  activity_level: "moderate",
  diet_preference: "balanced",
  equipment: "bodyweight",
  training_days: 3,
};

function getInitialProfile(): UserProfile {
  if (typeof window === "undefined") return defaultProfile;

  try {
    const savedProfile = localStorage.getItem("trainwise_profile");
    if (!savedProfile) return defaultProfile;

    return JSON.parse(savedProfile) as UserProfile;
  } catch {
    localStorage.removeItem("trainwise_profile");
    return defaultProfile;
  }
}

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile>(getInitialProfile);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [nutritionError, setNutritionError] = useState("");
  const [workoutError, setWorkoutError] = useState("");
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [workoutLoading, setWorkoutLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    localStorage.setItem("trainwise_profile", JSON.stringify(profile));
  }, [profile]);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
    setNutritionPlan(null);
    setWorkoutPlan(null);
    setNutritionError("");
    setWorkoutError("");
    localStorage.removeItem("trainwise_profile");
  };

  const validateProfile = (data: UserProfile) => {
    if (!data.name.trim()) return "Name is required.";
    if (data.age < 13 || data.age > 80) return "Age must be between 13 and 80.";
    if (data.weight_kg <= 20 || data.weight_kg > 300) {
      return "Weight must be between 20 and 300 kg.";
    }
    if (data.height_cm <= 100 || data.height_cm > 250) {
      return "Height must be between 100 and 250 cm.";
    }
    if (data.training_days < 2 || data.training_days > 7) {
      return "Training days must be between 2 and 7.";
    }
    return "";
  };

  const generateNutrition = async () => {
    setNutritionError("");
    const validationError = validateProfile(profile);
    if (validationError) {
      setNutritionError(validationError);
      return;
    }

    setNutritionLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/nutrition/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        setNutritionError(
          data?.detail ? JSON.stringify(data.detail) : "Failed to generate nutrition plan."
        );
        return;
      }

      setNutritionPlan(data);
      triggerToast("Nutrition plan generated.");
    } catch (error) {
      console.error("Nutrition request failed", error);
      setNutritionError("Failed to connect to the backend.");
    } finally {
      setNutritionLoading(false);
    }
  };

  const generateWorkout = async () => {
    setWorkoutError("");
    const validationError = validateProfile(profile);
    if (validationError) {
      setWorkoutError(validationError);
      return;
    }

    setWorkoutLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/workout/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        setWorkoutError(
          data?.detail ? JSON.stringify(data.detail) : "Failed to generate workout plan."
        );
        return;
      }

      setWorkoutPlan(data);
      triggerToast("Workout plan generated.");
    } catch (error) {
      console.error("Workout request failed", error);
      setWorkoutError("Failed to connect to the backend.");
    } finally {
      setWorkoutLoading(false);
    }
  };

  const shouldShowStats =
    profile.name.trim() !== "" &&
    !(profile.age === 18 && profile.weight_kg === 50 && profile.height_cm === 170);

  return (
    <main className="min-h-screen px-4 py-6 md:px-6 md:py-8">
      <Toast message={toastMessage} show={showToast} />

      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[24px] border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm md:p-8">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              AI Fitness & Nutrition Coach
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              TrainWise
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-slate-600 md:text-xl">
              Smarter Fitness. Personalized Coaching.
            </p>
          </div>
        </section>

        <ProfileForm
          profile={profile}
          setProfile={setProfile}
          onGenerateNutrition={generateNutrition}
          onGenerateWorkout={generateWorkout}
          onResetProfile={resetProfile}
          nutritionLoading={nutritionLoading}
          workoutLoading={workoutLoading}
        />

        {nutritionError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {nutritionError}
          </div>
        )}

        {workoutError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {workoutError}
          </div>
        )}

        {shouldShowStats && (
          <StatsCard
            weightKg={profile.weight_kg}
            heightCm={profile.height_cm}
            age={profile.age}
            sex={profile.sex}
            activityLevel={profile.activity_level}
          />
        )}

        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2">
          <NutritionCard plan={nutritionPlan} loading={nutritionLoading} />
          <WorkoutCard plan={workoutPlan} loading={workoutLoading} />
        </div>

        <ChatBox profile={profile} />
      </div>
    </main>
  );
}