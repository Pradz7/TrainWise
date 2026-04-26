"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types";

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
  if (typeof window === "undefined") {
    return defaultProfile;
  }

  try {
    const savedProfile = localStorage.getItem("trainwise_profile");

    if (savedProfile) {
      return JSON.parse(savedProfile) as UserProfile;
    }

    const savedUser = localStorage.getItem("trainwise_user");

    if (savedUser) {
      const user = JSON.parse(savedUser) as { name?: string };

      return {
        ...defaultProfile,
        name: user.name || "",
      };
    }

    return defaultProfile;
  } catch {
    localStorage.removeItem("trainwise_profile");
    return defaultProfile;
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(getInitialProfile);
  const [error, setError] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem("trainwise_logged_in");

    if (loggedIn !== "true") {
      router.replace("/auth?mode=login");
    }
  }, [router]);

  function updateProfile<K extends keyof UserProfile>(
    key: K,
    value: UserProfile[K]
  ) {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function validateProfile(data: UserProfile) {
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
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateProfile(profile);

    if (validationError) {
      setError(validationError);
      return;
    }

    localStorage.setItem("trainwise_profile", JSON.stringify(profile));
    localStorage.setItem("trainwise_profile_complete", "true");

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-8 md:px-6">
      <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-8">
        <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Step 2 of 2
        </p>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Complete your TrainWise profile
        </h1>

        <p className="mt-3 text-slate-600">
          Fill in your details so TrainWise can personalize your workouts,
          nutrition plans, and AI coaching.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
          <FormField label="Name">
            <input
              value={profile.name}
              onChange={(event) => updateProfile("name", event.target.value)}
              className="input"
              placeholder="Enter your name"
            />
          </FormField>

          <FormField label="Age">
            <input
              type="number"
              value={profile.age}
              onChange={(event) => updateProfile("age", Number(event.target.value))}
              className="input"
              placeholder="Enter your age"
            />
          </FormField>

          <FormField label="Sex">
            <select
              value={profile.sex}
              onChange={(event) =>
                updateProfile("sex", event.target.value as UserProfile["sex"])
              }
              className="input"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </FormField>

          <FormField label="Weight (kg)">
            <input
              type="number"
              value={profile.weight_kg}
              onChange={(event) =>
                updateProfile("weight_kg", Number(event.target.value))
              }
              className="input"
              placeholder="Enter your weight"
            />
          </FormField>

          <FormField label="Height (cm)">
            <input
              type="number"
              value={profile.height_cm}
              onChange={(event) =>
                updateProfile("height_cm", Number(event.target.value))
              }
              className="input"
              placeholder="Enter your height"
            />
          </FormField>

          <FormField label="Goal">
            <select
              value={profile.goal}
              onChange={(event) =>
                updateProfile("goal", event.target.value as UserProfile["goal"])
              }
              className="input"
            >
              <option value="maintenance">Maintenance</option>
              <option value="fat_loss">Fat Loss</option>
              <option value="muscle_gain">Muscle Gain</option>
            </select>
          </FormField>

          <FormField label="Activity Level">
            <select
              value={profile.activity_level}
              onChange={(event) =>
                updateProfile(
                  "activity_level",
                  event.target.value as UserProfile["activity_level"]
                )
              }
              className="input"
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very Active</option>
            </select>
          </FormField>

          <FormField label="Diet Preference">
            <select
              value={profile.diet_preference}
              onChange={(event) =>
                updateProfile(
                  "diet_preference",
                  event.target.value as UserProfile["diet_preference"]
                )
              }
              className="input"
            >
              <option value="balanced">Balanced</option>
              <option value="high_protein">High Protein</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>
          </FormField>

          <FormField label="Equipment">
            <select
              value={profile.equipment}
              onChange={(event) =>
                updateProfile(
                  "equipment",
                  event.target.value as UserProfile["equipment"]
                )
              }
              className="input"
            >
              <option value="bodyweight">Bodyweight</option>
              <option value="dumbbells">Dumbbells</option>
              <option value="gym">Gym</option>
            </select>
          </FormField>

          <FormField label="Training Days / Week">
            <input
              type="number"
              value={profile.training_days}
              onChange={(event) =>
                updateProfile("training_days", Number(event.target.value))
              }
              className="input"
              placeholder="How many days?"
            />
          </FormField>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Continue to Dashboard
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}