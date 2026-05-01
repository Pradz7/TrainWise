"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
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

type SavedPlan = {
  id: string;
  plan_type: "nutrition" | "workout";
  title: string;
  content: NutritionPlan | WorkoutPlan;
  created_at: string;
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

export default function SavedPlansPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadPageData() {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (ignore) return;

      if (userError || !user) {
        router.replace("/auth?mode=login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "name, age, sex, weight_kg, height_cm, goal, activity_level, diet_preference, equipment, training_days"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (ignore) return;

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (!profileData) {
        router.replace("/onboarding");
        return;
      }

      setProfile(mapProfileRow(profileData as ProfileRow));

      const { data: plansData, error: plansError } = await supabase
        .from("saved_plans")
        .select("id, plan_type, title, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ignore) return;

      if (plansError) {
        setError(plansError.message);
        setLoading(false);
        return;
      }

      setPlans((plansData || []) as SavedPlan[]);
      setLoading(false);
    }

    loadPageData();

    return () => {
      ignore = true;
    };
  }, [router]);

  async function deletePlan(id: string) {
    setDeletingId(id);
    setError("");

    const { error: deleteError } = await supabase
      .from("saved_plans")
      .delete()
      .eq("id", id);

    setDeletingId("");

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setPlans((currentPlans) => currentPlans.filter((plan) => plan.id !== id));
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Loading saved plans...
      </main>
    );
  }

  return (
    <>
      <Navbar profile={profile} />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 md:px-6">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Your saved TrainWise plans
              </h1>

              <p className="mt-2 text-slate-600 dark:text-slate-300">
                View nutrition and workout plans you saved from the dashboard.
              </p>
            </div>

          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
              {error}
            </div>
          )}

          {plans.length === 0 ? (
            <section className="rounded-[28px] border border-dashed border-slate-300 bg-white/90 p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                No saved plans yet
              </h2>

              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Generate a workout or nutrition plan on the dashboard, then
                click Save Plan.
              </p>

              <Link
                href="/dashboard#plans"
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Go to Plans
              </Link>
            </section>
          ) : (
            <section className="grid gap-6 lg:grid-cols-2">
              {plans.map((plan) => (
                <SavedPlanCard
                  key={plan.id}
                  plan={plan}
                  deleting={deletingId === plan.id}
                  onDelete={() => deletePlan(plan.id)}
                />
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
}

function SavedPlanCard({
  plan,
  deleting,
  onDelete,
}: {
  plan: SavedPlan;
  deleting: boolean;
  onDelete: () => void;
}) {
  const createdDate = new Date(plan.created_at).toLocaleDateString();

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
        <div>
          <p
            className={[
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              plan.plan_type === "nutrition"
                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
            ].join(" ")}
          >
            {plan.plan_type}
          </p>

          <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
            {plan.title || formatPlanTitle(plan.plan_type)}
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Saved on {createdDate}
          </p>
        </div>

        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <div className="p-5">
        {plan.plan_type === "nutrition" ? (
          <NutritionPreview plan={plan.content as NutritionPlan} />
        ) : (
          <WorkoutPreview plan={plan.content as WorkoutPlan} />
        )}
      </div>
    </article>
  );
}

function NutritionPreview({ plan }: { plan: NutritionPlan }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat label="Calories" value={`${plan.calories}`} />
        <MiniStat label="Protein" value={`${plan.protein_g}g`} />
        <MiniStat label="Carbs" value={`${plan.carbs_g}g`} />
        <MiniStat label="Fats" value={`${plan.fats_g}g`} />
      </div>

      <div className="space-y-3">
        {plan.meals.slice(0, 4).map((meal, index) => (
          <div
            key={`${meal.meal_type}-${index}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
          >
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {formatPlanTitle(meal.meal_type)}
            </p>

            <h3 className="mt-1 font-bold text-slate-900 dark:text-white">
              {meal.food_name}
            </h3>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {meal.calories} kcal • Protein {meal.protein}g • Carbs{" "}
              {meal.carbs}g • Fats {meal.fats}g
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkoutPreview({ plan }: { plan: WorkoutPlan }) {
  return (
    <div className="space-y-3">
      {plan.plan.map((day, index) => (
        <div
          key={`${day.day}-${index}`}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
        >
          <h3 className="font-bold text-slate-900 dark:text-white">
            {day.day} — {day.focus}
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {day.exercises.length} exercises
          </p>

          <ul className="mt-3 space-y-2">
            {day.exercises.slice(0, 3).map((exercise, exerciseIndex) => (
              <li
                key={`${exercise.exercise_name}-${exerciseIndex}`}
                className="text-sm text-slate-600 dark:text-slate-300"
              >
                • {exercise.exercise_name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function formatPlanTitle(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}