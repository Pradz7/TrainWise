"use client";

import { useMemo, useState } from "react";

type TrackerEntry = {
  date: string;
  weight: string;
  musclePart: string;
};

type TrackerEntries = Record<string, TrackerEntry>;

const muscleParts = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Full Body",
  "Cardio",
  "Rest Day",
];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getInitialEntries(): TrackerEntries {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const savedEntries = localStorage.getItem("trainwise_calendar_tracker");

    if (savedEntries) {
      return JSON.parse(savedEntries) as TrackerEntries;
    }

    return {};
  } catch {
    localStorage.removeItem("trainwise_calendar_tracker");
    return {};
  }
}

const today = formatDate(new Date());

export default function ProgressTracker() {
  const [entries, setEntries] = useState<TrackerEntries>(getInitialEntries);
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [weight, setWeight] = useState(() => entries[today]?.weight || "");
  const [musclePart, setMusclePart] = useState(
    () => entries[today]?.musclePart || "Chest"
  );
  const [message, setMessage] = useState("");

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingBlankDays = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: Array<string | null> = [];

    for (let i = 0; i < startingBlankDays; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(formatDate(new Date(year, month, day)));
    }

    return days;
  }, [currentMonth]);

  function openDate(date: string) {
    const entry = entries[date];

    setSelectedDate(date);
    setWeight(entry?.weight || "");
    setMusclePart(entry?.musclePart || "Chest");
    setMessage("");
  }

  function saveEntry() {
    if (!selectedDate) return;

    if (!weight.trim()) {
      setMessage("Please enter your weight.");
      return;
    }

    const updatedEntries: TrackerEntries = {
      ...entries,
      [selectedDate]: {
        date: selectedDate,
        weight: weight.trim(),
        musclePart,
      },
    };

    setEntries(updatedEntries);
    localStorage.setItem(
      "trainwise_calendar_tracker",
      JSON.stringify(updatedEntries)
    );

    setMessage("Tracker saved.");
  }

  function deleteEntry() {
    const updatedEntries = { ...entries };

    delete updatedEntries[selectedDate];

    setEntries(updatedEntries);
    localStorage.setItem(
      "trainwise_calendar_tracker",
      JSON.stringify(updatedEntries)
    );

    setWeight("");
    setMusclePart("Chest");
    setMessage("Tracker entry deleted.");
  }

  function goToPreviousMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  }

  function goToNextMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  }

  function goToToday() {
    const now = new Date();
    const todayDate = formatDate(now);

    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    openDate(todayDate);
  }

  const selectedEntry = entries[selectedDate];

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950/70 dark:text-green-300">
            Calendar Tracker
          </p>

          <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            Track your workout progress
          </h2>

          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Click a date to log your weight and the muscle group you trained.
          </p>
        </div>

        <button
          type="button"
          onClick={goToToday}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Today
        </button>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Previous
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {currentMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h3>

            <button
              type="button"
              onClick={goToNextMonth}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`blank-${index}`} />;
              }

              const dayNumber = parseDate(date).getDate();
              const entry = entries[date];
              const hasEntry = Boolean(entry);
              const isSelected = selectedDate === date;
              const isToday = date === today;

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => openDate(date)}
                  className={[
                    "relative min-h-24 rounded-2xl border p-2 text-left transition-all duration-200",
                    isSelected
                      ? "border-blue-500 bg-blue-600 text-white shadow-[0_0_0_3px_rgba(59,130,246,0.25)] dark:border-blue-400 dark:bg-blue-500 dark:text-white"
                      : "border-slate-200 bg-white text-slate-900 hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-blue-400 dark:hover:bg-slate-800",
                    isToday && !isSelected
                      ? "ring-2 ring-blue-200 dark:ring-blue-900"
                      : "",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={[
                        "font-semibold",
                        isSelected
                          ? "text-white"
                          : "text-slate-900 dark:text-slate-100",
                      ].join(" ")}
                    >
                      {dayNumber}
                    </span>

                    {hasEntry && (
                      <span
                        className={[
                          "h-2.5 w-2.5 rounded-full",
                          isSelected ? "bg-white" : "bg-green-500",
                        ].join(" ")}
                      />
                    )}
                  </div>

                  {hasEntry && (
                    <div className="mt-3 space-y-1 text-xs">
                      <p
                        className={
                          isSelected
                            ? "text-blue-100"
                            : "text-slate-600 dark:text-slate-400"
                        }
                      >
                        {entry.weight} kg
                      </p>

                      <p
                        className={[
                          "font-medium",
                          isSelected
                            ? "text-white"
                            : "text-slate-800 dark:text-slate-200",
                        ].join(" ")}
                      >
                        {entry.musclePart}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/80">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Edit selected date
          </h3>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {parseDate(selectedDate).toLocaleDateString("default", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Weight (kg)
              </span>
              <input
                type="number"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                className="input mt-1"
                placeholder="e.g. 67"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Muscle Part
              </span>
              <select
                value={musclePart}
                onChange={(event) => setMusclePart(event.target.value)}
                className="input mt-1"
              >
                {muscleParts.map((part) => (
                  <option key={part} value={part}>
                    {part}
                  </option>
                ))}
              </select>
            </label>

            {selectedEntry && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/60 dark:text-green-200">
                <p className="font-semibold">Saved entry</p>
                <p className="mt-1">Weight: {selectedEntry.weight} kg</p>
                <p>Muscle: {selectedEntry.musclePart}</p>
              </div>
            )}

            {message && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-200">
                {message}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={saveEntry}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Save Date
              </button>

              <button
                type="button"
                onClick={deleteEntry}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}