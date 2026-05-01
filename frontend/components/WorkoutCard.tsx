"use client";

import { useState } from "react";
import { WorkoutPlan } from "@/types";

type Props = {
  plan: WorkoutPlan | null;
  loading?: boolean;
  onSave?: () => void;
  saving?: boolean;
};

export default function WorkoutCard({
  plan,
  loading = false,
  onSave,
  saving = false,
}: Props) {
  const [openDays, setOpenDays] = useState<number[]>([0]);

  if (loading) {
    return (
      <section className="self-start rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
          Workout Plan
        </h2>

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-2 h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-4 space-y-3">
                {[1, 2].map((sub) => (
                  <div
                    key={sub}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="h-4 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                ))}
              </div>
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
          Workout Plan
        </h2>
        <p className="text-slate-500 dark:text-slate-300">
          Fill in your profile and click “Generate Workout Plan” to get a
          personalized training split.
        </p>
      </section>
    );
  }

  const toggleDay = (index: number) => {
    setOpenDays((prev) =>
      prev.includes(index)
        ? prev.filter((day) => day !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="self-start rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
            Generated plan
          </p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Workout Plan
          </h2>
        </div>

        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Plan"}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {plan.plan.map((day, index) => {
          const isOpen = openDays.includes(index);

          return (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            >
              <button
                type="button"
                onClick={() => toggleDay(index)}
                className="flex w-full items-center justify-between bg-slate-50 px-5 py-4 text-left hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {day.day} — {day.focus}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {day.exercises.length} exercises
                  </p>
                </div>

                <span className="text-2xl text-slate-500 dark:text-slate-300">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="space-y-3 p-5">
                  {day.exercises.map((exercise, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"
                    >
                      <p className="font-medium text-slate-900 dark:text-white">
                        {exercise.exercise_name}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {exercise.instructions}
                      </p>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {exercise.equipment} • {exercise.difficulty} •{" "}
                        {exercise.goal}
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