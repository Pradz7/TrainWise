"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import NutritionCard from "@/components/NutritionCard";
import WorkoutCard from "@/components/WorkoutCard";
import ChatBox from "@/components/ChatBox";
import Toast from "@/components/Toast";
import ProgressTracker from "@/components/ProgressTracker";
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

type ProfileRow = {
  name: string;
  age: number;
  sex: string;
  weight_kg: number;
  height_cm: number;
  goal: string;
  activity_level: string;
  diet_preference: string;
  equipment: string;
  training_days: number;
};

function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    name: row.name || "",
    age: Number(row.age),
    sex: row.sex as UserProfile["sex"],
    weight_kg: Number(row.weight_kg),
    height_cm: Number(row.height_cm),
    goal: row.goal as UserProfile["goal"],
    activity_level: row.activity_level as UserProfile["activity_level"],
    diet_preference: row.diet_preference as UserProfile["diet_preference"],
    equipment: row.equipment as UserProfile["equipment"],
    training_days: Number(row.training_days),
  };
}

function loadLocalProfileFallback(): UserProfile {
  if (typeof window === "undefined") return { ...defaultProfile };

  try {
    const savedProfile = localStorage.getItem("trainwise_profile");
    const savedUser = localStorage.getItem("trainwise_user");

    let profile: UserProfile = savedProfile
      ? ({ ...defaultProfile, ...JSON.parse(savedProfile) } as UserProfile)
      : { ...defaultProfile };

    if (savedUser && !profile.name.trim()) {
      const user = JSON.parse(savedUser) as { name?: string };

      profile = {
        ...profile,
        name: user.name || "",
      };
    }

    return profile;
  } catch {
    localStorage.removeItem("trainwise_profile");
    return { ...defaultProfile };
  }
}

export default function DashboardPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [dashboardError, setDashboardError] = useState("");
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(
    null
  );
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [nutritionError, setNutritionError] = useState("");
  const [workoutError, setWorkoutError] = useState("");
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [workoutLoading, setWorkoutLoading] = useState(false);
  const [savingPlanType, setSavingPlanType] = useState<
    "nutrition" | "workout" | ""
  >("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadDashboardProfile() {
      setDashboardError("");

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

      localStorage.setItem("trainwise_logged_in", "true");
      localStorage.setItem(
        "trainwise_user",
        JSON.stringify({
          id: user.id,
          name: user.user_metadata?.name || "",
          email: user.email || "",
        })
      );

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "name, age, sex, weight_kg, height_cm, goal, activity_level, diet_preference, equipment, training_days"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (ignore) return;

      if (error) {
        setDashboardError(error.message);
        setProfile(loadLocalProfileFallback());
        setMounted(true);
        return;
      }

      if (!data) {
        router.replace("/onboarding");
        return;
      }

      const loadedProfile = mapProfileRow(data as ProfileRow);

      setProfile(loadedProfile);
      localStorage.setItem("trainwise_profile", JSON.stringify(loadedProfile));
      localStorage.setItem("trainwise_profile_complete", "true");

      setMounted(true);
    }

    loadDashboardProfile();

    return () => {
      ignore = true;
    };
  }, [router]);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 2500);
  };

  const validateProfile = (data: UserProfile) => {
    if (!data.name.trim()) return "Name is required. Please edit your profile.";
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        setNutritionError(
          data?.detail
            ? JSON.stringify(data.detail)
            : "Failed to generate nutrition plan."
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        setWorkoutError(
          data?.detail
            ? JSON.stringify(data.detail)
            : "Failed to generate workout plan."
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

  async function saveGeneratedPlan(
    planType: "nutrition" | "workout",
    plan: NutritionPlan | WorkoutPlan
  ) {
    setNutritionError("");
    setWorkoutError("");
    setSavingPlanType(planType);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        const message = "Please log in again before saving a plan.";

        if (planType === "nutrition") {
          setNutritionError(message);
        } else {
          setWorkoutError(message);
        }

        return;
      }

      const { error } = await supabase.from("saved_plans").insert({
        user_id: user.id,
        plan_type: planType,
        title:
          planType === "nutrition"
            ? `Nutrition Plan - ${new Date().toLocaleDateString()}`
            : `Workout Plan - ${new Date().toLocaleDateString()}`,
        content: plan,
      });

      if (error) {
        if (planType === "nutrition") {
          setNutritionError(error.message);
        } else {
          setWorkoutError(error.message);
        }

        return;
      }

      triggerToast(
        planType === "nutrition"
          ? "Nutrition plan saved."
          : "Workout plan saved."
      );
    } finally {
      setSavingPlanType("");
    }
  }

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Loading TrainWise...
      </main>
    );
  }

  return (
    <>
      <Navbar profile={profile} />

      <main
        className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(to_bottom_right,_#f8fbff,_#f8fafc,_#f0fdf4)] px-4 py-8 md:px-6"
        suppressHydrationWarning
      >
        <Toast message={toastMessage} show={showToast} />

        <div className="mx-auto max-w-6xl space-y-10">
          {dashboardError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
              {dashboardError}
            </div>
          )}

          <section
            id="overview"
            className="scroll-mt-28 rounded-[34px] border border-slate-200/80 bg-white/75 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/55 md:p-8"
          >
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Overview
                  </p>

                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                    Welcome back, {profile.name || "athlete"}!
                  </h1>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <InfoPill label="Goal" value={formatValue(profile.goal)} />
                    <InfoPill
                      label="Activity"
                      value={formatValue(profile.activity_level)}
                    />
                    <InfoPill
                      label="Diet"
                      value={formatValue(profile.diet_preference)}
                    />
                    <InfoPill
                      label="Training"
                      value={`${profile.training_days} days/week`}
                    />
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <OverviewMiniCard
                    label="Current Body"
                    title={`${profile.weight_kg} kg`}
                    description={`${profile.height_cm} cm height`}
                  />

                  <OverviewMiniCard
                    label="Training Setup"
                    title={formatValue(profile.equipment)}
                    description={`${profile.training_days} training days weekly`}
                  />

                  <OverviewMiniCard
                    label="Today’s Focus"
                    title={getGoalFocusTitle(profile.goal)}
                    description={getGoalFocusDescription(profile.goal)}
                  />

                  <OverviewMiniCard
                    label="Coach Tip"
                    title="Stay consistent"
                    description="Small daily progress beats random intense workouts."
                  />
                </div>
              </div>

              <BodyStatusCard profile={profile} />
            </div>
          </section>

          <section
            id="tracker"
          >
            <ProgressTracker />
          </section>

          <section
            id="plans"
            className="scroll-mt-28 rounded-[34px] border border-slate-200/80 bg-white/75 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/55 md:p-8"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Plans
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Generate your plans
                </h2>

                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  Create a nutrition plan or workout split using your current
                  profile.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={generateNutrition}
                  disabled={nutritionLoading}
                  className="rounded-full bg-slate-950 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {nutritionLoading ? "Generating..." : "Generate Nutrition"}
                </button>

                <button
                  type="button"
                  onClick={generateWorkout}
                  disabled={workoutLoading}
                  className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {workoutLoading ? "Generating..." : "Generate Workout"}
                </button>
              </div>
            </div>

            {nutritionError && (
              <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-red-700 ring-1 ring-red-100 dark:bg-red-950/50 dark:text-red-200 dark:ring-red-900">
                {nutritionError}
              </div>
            )}

            {workoutError && (
              <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-red-700 ring-1 ring-red-100 dark:bg-red-950/50 dark:text-red-200 dark:ring-red-900">
                {workoutError}
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
              <NutritionCard
                plan={nutritionPlan}
                loading={nutritionLoading}
                saving={savingPlanType === "nutrition"}
                onSave={
                  nutritionPlan
                    ? () => saveGeneratedPlan("nutrition", nutritionPlan)
                    : undefined
                }
              />

              <WorkoutCard
                plan={workoutPlan}
                loading={workoutLoading}
                saving={savingPlanType === "workout"}
                onSave={
                  workoutPlan
                    ? () => saveGeneratedPlan("workout", workoutPlan)
                    : undefined
                }
              />
            </div>
          </section>

          <ChatBox profile={profile} />
        </div>
      </main>
    </>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function OverviewMiniCard({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}

function BodyStatusCard({ profile }: { profile: UserProfile }) {
  const bmi = calculateBmi(profile.weight_kg, profile.height_cm);
  const status = getBmiStatus(bmi);
  const bmr = calculateBmr(
    profile.weight_kg,
    profile.height_cm,
    profile.age,
    profile.sex
  );
  const tdee = calculateTdee(bmr, profile.activity_level);

  return (
    <div
      className={[
        "flex min-h-full flex-col justify-between rounded-[28px] p-6 text-white shadow-[0_20px_60px_rgba(16,185,129,0.22)] md:p-7",
        status.gradient,
      ].join(" ")}
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/70">Body status</p>

            <div className="mt-4 flex items-end gap-3">
              <h3 className="text-5xl font-bold leading-none md:text-6xl">
                {bmi.toFixed(1)}
              </h3>
              <p className="pb-2 text-sm font-medium text-white/70">BMI</p>
            </div>
          </div>

          <div className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
            {status.label}
          </div>
        </div>

        <p className="mt-5 max-w-md text-sm leading-relaxed text-white/80">
          {status.description}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <BodyMetric label="BMR" value={Math.round(bmr)} note="Calories at rest" />
          <BodyMetric
            label="TDEE"
            value={Math.round(tdee)}
            note="Maintenance calories/day"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="rounded-full bg-white/12 px-5 py-3 text-sm font-semibold text-white">
          {profile.weight_kg} kg • {profile.height_cm} cm
        </div>

        <div className="rounded-full bg-white/12 px-5 py-3 text-sm font-semibold text-white">
          {formatValue(profile.goal)}
        </div>
      </div>
    </div>
  );
}

function BodyMetric({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div className="rounded-2xl bg-white/13 p-4 backdrop-blur-sm ring-1 ring-white/10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">{value}</p>

      <p className="mt-2 text-sm text-white/75">{note}</p>
    </div>
  );
}

function calculateBmi(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;

  if (!weightKg || !heightM) {
    return 0;
  }

  return weightKg / (heightM * heightM);
}

function calculateBmr(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: string
) {
  if (sex === "female") {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
}

function calculateTdee(bmr: number, activityLevel: string) {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return bmr * (multipliers[activityLevel] || 1.55);
}

function getBmiStatus(bmi: number) {
  if (bmi < 18.5) {
    return {
      label: "Underweight",
      description:
        "Your BMI is below the healthy range. Focus on consistent meals, enough protein, and gradual strength training.",
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
    };
  }

  if (bmi < 25) {
    return {
      label: "Healthy Weight",
      description:
        "Your BMI is in the healthy range. Keep building consistency with training, nutrition, sleep, and recovery.",
      gradient: "bg-gradient-to-br from-emerald-600 to-teal-700",
    };
  }

  if (bmi < 30) {
    return {
      label: "Overweight",
      description:
        "Your BMI is above the healthy range. A balanced calorie target, regular workouts, and daily movement can help.",
      gradient: "bg-gradient-to-br from-blue-600 to-indigo-700",
    };
  }

  return {
    label: "Obesity",
    description:
      "Your BMI is in the obesity range. Start with sustainable habits and consider professional guidance for safer progress.",
    gradient: "bg-gradient-to-br from-rose-600 to-red-700",
  };
}

function getGoalFocusTitle(goal: string) {
  if (goal === "weight_loss" || goal === "fat_loss") {
    return "Calorie control";
  }

  if (goal === "muscle_gain" || goal === "gain_muscle") {
    return "Build strength";
  }

  if (goal === "maintenance") {
    return "Maintain balance";
  }

  return "Improve fitness";
}

function getGoalFocusDescription(goal: string) {
  if (goal === "weight_loss" || goal === "fat_loss") {
    return "Focus on protein, steps, and a steady calorie deficit.";
  }

  if (goal === "muscle_gain" || goal === "gain_muscle") {
    return "Focus on progressive overload, protein, and recovery.";
  }

  if (goal === "maintenance") {
    return "Keep training consistent while maintaining stable energy.";
  }

  return "Follow your plan and keep tracking your progress.";
}

function formatValue(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}