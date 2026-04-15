"use client";

import { useState } from "react";
import { WorkoutPlan } from "@/types";

type Props = {
  plan: WorkoutPlan | null;
  loading?: boolean;
};

export default function WorkoutCard({ plan, loading = false }: Props) {
  const [openDays, setOpenDays] = useState<number[]>([0]);

  if (loading) {
    return (
      <section className="self-start rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Workout Plan</h2>

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 space-y-3">
                {[1, 2].map((sub) => (
                  <div
                    key={sub}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
                    <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-200" />
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
      <section className="self-start rounded-[28px] border border-dashed border-slate-300 bg-white p-8 shadow-sm">
        <h2 className="mb-3 text-2xl font-bold text-slate-900">Workout Plan</h2>
        <p className="text-slate-500">
          Fill in your profile and click “Generate Workout Plan” to get a personalized training
          split.
        </p>
      </section>
    );
  }

  const toggleDay = (index: number) => {
    setOpenDays((prev) =>
      prev.includes(index) ? prev.filter((day) => day !== index) : [...prev, index]
    );
  };

  return (
    <section className="self-start rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Workout Plan</h2>

      <div className="space-y-4">
        {plan.plan.map((day, index) => {
          const isOpen = openDays.includes(index);

          return (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <button
                type="button"
                onClick={() => toggleDay(index)}
                className="flex w-full items-center justify-between bg-slate-50 px-5 py-4 text-left hover:bg-slate-100"
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {day.day} — {day.focus}
                  </h3>
                  <p className="text-sm text-slate-500">{day.exercises.length} exercises</p>
                </div>

                <span className="text-2xl text-slate-500">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div className="space-y-3 p-5">
                  {day.exercises.map((exercise, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="font-medium text-slate-900">{exercise.exercise_name}</p>
                      <p className="mt-1 text-sm text-slate-600">{exercise.instructions}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {exercise.equipment} • {exercise.difficulty} • {exercise.goal}
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