"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type TrackerEntry = {
  date: string;
  weight: string;
  musclePart: string;
  imageUrl?: string;
};

type TrackerEntries = Record<string, TrackerEntry>;

type TrackerRow = {
  entry_date: string;
  weight_kg: number;
  muscle_part: string;
  image_url: string | null;
};

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

function getMonthRange(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    startDate: formatDate(firstDay),
    endDate: formatDate(lastDay),
  };
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

function mapRowsToEntries(rows: TrackerRow[]) {
  return rows.reduce<TrackerEntries>((acc, row) => {
    acc[row.entry_date] = {
      date: row.entry_date,
      weight: String(row.weight_kg),
      musclePart: row.muscle_part,
      imageUrl: row.image_url || "",
    };

    return acc;
  }, {});
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(
    () => entries[today]?.imageUrl || ""
  );
  const [userId, setUserId] = useState("");
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (ignore) return;

      if (error || !user) {
        setMessage("Please log in to use the tracker.");
        setLoadingEntries(false);
        return;
      }

      setUserId(user.id);
    }

    loadUser();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadMonthEntries() {
      if (!userId) return;

      setLoadingEntries(true);
      setMessage("");

      const { startDate, endDate } = getMonthRange(currentMonth);

      const { data, error } = await supabase
        .from("tracker_entries")
        .select("entry_date, weight_kg, muscle_part, image_url")
        .eq("user_id", userId)
        .gte("entry_date", startDate)
        .lte("entry_date", endDate)
        .order("entry_date", { ascending: true });

      if (ignore) return;

      if (error) {
        setMessage(error.message);
        setLoadingEntries(false);
        return;
      }

      const monthEntries = mapRowsToEntries((data || []) as TrackerRow[]);

      setEntries((current) => {
        const updatedEntries = {
          ...current,
          ...monthEntries,
        };

        localStorage.setItem(
          "trainwise_calendar_tracker",
          JSON.stringify(updatedEntries)
        );

        return updatedEntries;
      });

      const selectedEntry = monthEntries[selectedDate];

      if (selectedEntry) {
        setWeight(selectedEntry.weight);
        setMusclePart(selectedEntry.musclePart);
        setImagePreview(selectedEntry.imageUrl || "");
        setImageFile(null);
      }

      setLoadingEntries(false);
    }

    loadMonthEntries();

    return () => {
      ignore = true;
    };
  }, [currentMonth, userId, selectedDate]);

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
    setImageFile(null);
    setImagePreview(entry?.imageUrl || "");
    setMessage("");
  }

  async function uploadTrackerImage() {
    if (!imageFile || !userId) {
      return imagePreview || "";
    }

    const fileExtension = imageFile.name.split(".").pop() || "jpg";
    const safeDate = selectedDate.replaceAll("-", "");
    const filePath = `${userId}/${safeDate}-${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("tracker-images")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("tracker-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function saveEntry() {
    if (!selectedDate || saving) return;

    if (!userId) {
      setMessage("Please log in again before saving.");
      return;
    }

    if (!weight.trim()) {
      setMessage("Please enter your weight.");
      return;
    }

    const numericWeight = Number(weight);

    if (
      Number.isNaN(numericWeight) ||
      numericWeight <= 20 ||
      numericWeight > 300
    ) {
      setMessage("Weight must be between 20 and 300 kg.");
      return;
    }

    setSaving(true);
    setMessage("");

    let imageUrl = imagePreview;

    try {
      imageUrl = await uploadTrackerImage();
    } catch (error) {
      setSaving(false);
      setMessage(
        error instanceof Error ? error.message : "Failed to upload image."
      );
      return;
    }

    const { error } = await supabase.from("tracker_entries").upsert(
      {
        user_id: userId,
        entry_date: selectedDate,
        weight_kg: numericWeight,
        muscle_part: musclePart,
        image_url: imageUrl || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,entry_date",
      }
    );

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const updatedEntries: TrackerEntries = {
      ...entries,
      [selectedDate]: {
        date: selectedDate,
        weight: String(numericWeight),
        musclePart,
        imageUrl,
      },
    };

    setEntries(updatedEntries);
    localStorage.setItem(
      "trainwise_calendar_tracker",
      JSON.stringify(updatedEntries)
    );

    setWeight(String(numericWeight));
    setImageFile(null);
    setImagePreview(imageUrl);
    setMessage("Tracker saved.");
  }

  async function deleteEntry() {
    if (!selectedDate || saving) return;

    if (!userId) {
      setMessage("Please log in again before deleting.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("tracker_entries")
      .delete()
      .eq("user_id", userId)
      .eq("entry_date", selectedDate);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const updatedEntries = { ...entries };

    delete updatedEntries[selectedDate];

    setEntries(updatedEntries);
    localStorage.setItem(
      "trainwise_calendar_tracker",
      JSON.stringify(updatedEntries)
    );

    setWeight("");
    setMusclePart("Chest");
    setImageFile(null);
    setImagePreview("");
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
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
            Calendar Tracker
          </p>

          <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            Track your workout progress
          </h2>

          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Click a date to log your weight, muscle group, and optional
            progress image.
          </p>

          {loadingEntries && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Loading tracker entries...
            </p>
          )}
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
        <div className="rounded-[28px] border border-blue-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-blue-800/60 dark:bg-slate-900/70 md:p-6">
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

                      {entry.imageUrl && (
                        <span
                          className={
                            isSelected
                              ? "text-blue-100"
                              : "text-blue-600 dark:text-blue-300"
                          }
                        >
                          Image added
                        </span>
                      )}
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

            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Progress Image optional
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) return;

                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }}
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </label>

            {imagePreview && (
              <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                <img
                  src={imagePreview}
                  alt="Progress preview"
                  className="h-44 w-full rounded-xl object-cover"
                />

                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  className="mt-3 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Remove Image
                </button>
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
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Date"}
              </button>

              <button
                type="button"
                onClick={deleteEntry}
                disabled={saving}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
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