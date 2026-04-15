"use client";

import { useState } from "react";
import { NutritionPlan } from "@/types";

type Props = {
  plan: NutritionPlan | null;
  loading?: boolean;
};

const mealOrder = ["breakfast", "lunch", "dinner", "snack"];

const mealTitles: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

export default function NutritionCard({ plan, loading = false }: Props) {
  const [openSections, setOpenSections] = useState<string[]>(["breakfast"]);

  if (loading) {
    return (
      <section className="self-start rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Nutrition Plan</h2>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-8 w-20 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!plan) {
    return (
      <section className="self-start rounded-[28px] border border-dashed border-slate-300 bg-white p-8 shadow-sm">
        <h2 className="mb-3 text-2xl font-bold text-slate-900">Nutrition Plan</h2>
        <p className="text-slate-500">
          Fill in your profile and click “Generate Nutrition Plan” to see calorie targets and
          meal suggestions.
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
    <section className="self-start rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Nutrition Plan</h2>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Calories</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{plan.calories}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Protein</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{plan.protein_g}g</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Carbs</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{plan.carbs_g}g</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Fats</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{plan.fats_g}g</p>
        </div>
      </div>

      <div className="space-y-4">
        {groupedMeals.map((group) => {
          const isOpen = openSections.includes(group.mealType);

          return (
            <div
              key={group.mealType}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <button
                type="button"
                onClick={() => toggleSection(group.mealType)}
                className="flex w-full items-center justify-between bg-slate-50 px-5 py-4 text-left hover:bg-slate-100"
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{group.title}</h3>
                  <p className="text-sm text-slate-500">{group.items.length} meals</p>
                </div>

                <span className="text-2xl text-slate-500">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div className="space-y-4 p-5">
                  {group.items.map((meal, index) => (
                    <div
                      key={`${group.mealType}-${index}`}
                      className="rounded-2xl border border-slate-200 p-5"
                    >
                      <h4 className="text-lg font-semibold text-slate-900">{meal.food_name}</h4>
                      <p className="mt-2 text-slate-600">
                        {meal.calories} kcal • Protein {meal.protein}g • Carbs {meal.carbs}g •
                        Fats {meal.fats}g
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{meal.diet_type}</p>
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