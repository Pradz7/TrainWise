"use client";

import { useState } from "react";
import { NutritionPlan } from "@/types";

type Props = {
  plan: NutritionPlan | null;
  loading?: boolean;
  onSave?: () => void;
  saving?: boolean;
};

const mealOrder = ["breakfast", "lunch", "dinner", "snack"];

const mealTitles: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

export default function NutritionCard({
  plan,
  loading = false,
  onSave,
  saving = false,
}: Props) {
  const [openSections, setOpenSections] = useState<string[]>(["breakfast"]);

  if (loading) {
    return (
      <section className="self-start rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
          Nutrition Plan
        </h2>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-3 h-8 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!plan) {
    return (
      <section className="self-start rounded-[28px] border border-dashed border-slate-300 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">
          Nutrition Plan
        </h2>
        <p className="text-slate-500 dark:text-slate-300">
          Fill in your profile and click “Generate Nutrition Plan” to see
          calorie targets and meal suggestions.
        </p>
      </section>
    );
  }

  const groupedMeals = mealOrder
    .map((mealType) => ({
      mealType,
      title: mealTitles[mealType],
      items: plan.meals.filter((meal) => meal.meal_type === mealType),
    }))
    .filter((group) => group.items.length > 0);

  const toggleSection = (mealType: string) => {
    setOpenSections((prev) =>
      prev.includes(mealType)
        ? prev.filter((item) => item !== mealType)
        : [...prev, mealType]
    );
  };

  return (
    <section className="self-start rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-green-600 dark:text-green-300">
            Generated plan
          </p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Nutrition Plan
          </h2>
        </div>

        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Plan"}
          </button>
        )}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MacroCard label="Calories" value={`${plan.calories}`} />
        <MacroCard label="Protein" value={`${plan.protein_g}g`} />
        <MacroCard label="Carbs" value={`${plan.carbs_g}g`} />
        <MacroCard label="Fats" value={`${plan.fats_g}g`} />
      </div>

      <div className="space-y-4">
        {groupedMeals.map((group) => {
          const isOpen = openSections.includes(group.mealType);

          return (
            <div
              key={group.mealType}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            >
              <button
                type="button"
                onClick={() => toggleSection(group.mealType)}
                className="flex w-full items-center justify-between bg-slate-50 px-5 py-4 text-left hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {group.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {group.items.length} meals
                  </p>
                </div>

                <span className="text-2xl text-slate-500 dark:text-slate-300">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="space-y-4 p-5">
                  {group.items.map((meal, index) => (
                    <div
                      key={`${group.mealType}-${index}`}
                      className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700 dark:bg-slate-800/60"
                    >
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {meal.food_name}
                      </h4>
                      <p className="mt-2 text-slate-600 dark:text-slate-300">
                        {meal.calories} kcal • Protein {meal.protein}g • Carbs{" "}
                        {meal.carbs}g • Fats {meal.fats}g
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {meal.diet_type}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MacroCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}