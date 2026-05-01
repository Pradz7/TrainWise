"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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

function getLocalProfileFallback(): UserProfile {
  if (typeof window === "undefined") {
    return { ...defaultProfile };
  }

  try {
    const savedProfile = localStorage.getItem("trainwise_profile");

    if (savedProfile) {
      return {
        ...defaultProfile,
        ...(JSON.parse(savedProfile) as UserProfile),
      };
    }

    const savedUser = localStorage.getItem("trainwise_user");

    if (savedUser) {
      const user = JSON.parse(savedUser) as { name?: string };

      return {
        ...defaultProfile,
        name: user.name || "",
      };
    }

    return { ...defaultProfile };
  } catch {
    localStorage.removeItem("trainwise_profile");
    return { ...defaultProfile };
  }
}

export default function OnboardingPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (ignore) return;

      if (userError || !user) {
        localStorage.removeItem("trainwise_logged_in");
        router.replace("/auth?mode=login");
        return;
      }

      setUserId(user.id);

      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "name, age, sex, weight_kg, height_cm, goal, activity_level, diet_preference, equipment, training_days"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (ignore) return;

      if (profileError) {
        setError(profileError.message);
        setProfile({
          ...getLocalProfileFallback(),
          name:
            user.user_metadata?.name ||
            getLocalProfileFallback().name ||
            "",
        });
        setLoading(false);
        return;
      }

      if (existingProfile) {
        const loadedProfile: UserProfile = {
          name: existingProfile.name || "",
          age: Number(existingProfile.age),
          sex: existingProfile.sex as UserProfile["sex"],
          weight_kg: Number(existingProfile.weight_kg),
          height_cm: Number(existingProfile.height_cm),
          goal: existingProfile.goal as UserProfile["goal"],
          activity_level:
            existingProfile.activity_level as UserProfile["activity_level"],
          diet_preference:
            existingProfile.diet_preference as UserProfile["diet_preference"],
          equipment: existingProfile.equipment as UserProfile["equipment"],
          training_days: Number(existingProfile.training_days),
        };

        setProfile(loadedProfile);
        localStorage.setItem("trainwise_profile", JSON.stringify(loadedProfile));
        localStorage.setItem("trainwise_profile_complete", "true");
      } else {
        const localProfile = getLocalProfileFallback();

        setProfile({
          ...localProfile,
          name: localProfile.name || user.user_metadata?.name || "",
        });
      }

      setLoading(false);
    }

    loadProfile();

    return () => {
      ignore = true;
    };
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const validationError = validateProfile(profile);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!userId) {
      setError("No logged-in user found. Please log in again.");
      router.replace("/auth?mode=login");
      return;
    }

    setSaving(true);

    const { error: saveError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        name: profile.name.trim(),
        age: profile.age,
        sex: profile.sex,
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
        goal: profile.goal,
        activity_level: profile.activity_level,
        diet_preference: profile.diet_preference,
        equipment: profile.equipment,
        training_days: profile.training_days,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    );

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    localStorage.setItem("trainwise_profile", JSON.stringify(profile));
    localStorage.setItem("trainwise_profile_complete", "true");

    router.push("/dashboard");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 text-slate-600 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-300">
        Loading your profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 md:px-6">
      <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 md:p-8">
        <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/70 dark:text-blue-300">
          Step 2 of 2
        </p>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
          Complete your TrainWise profile
        </h1>

        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Fill in your details so TrainWise can personalize your workouts,
          nutrition plans, and AI coaching.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
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
              onChange={(event) =>
                updateProfile("age", Number(event.target.value))
              }
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
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving profile..." : "Continue to Dashboard"}
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
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}