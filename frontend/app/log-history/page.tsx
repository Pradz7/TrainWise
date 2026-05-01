"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
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

type TrackerHistoryRow = {
  entry_date: string;
  weight_kg: number;
  muscle_part: string;
  image_url: string | null;
  updated_at: string | null;
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

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("default", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function LogHistoryPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [entries, setEntries] = useState<TrackerHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadHistory() {
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

      const { data: trackerData, error: trackerError } = await supabase
        .from("tracker_entries")
        .select("entry_date, weight_kg, muscle_part, image_url, updated_at")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false });

      if (ignore) return;

      if (trackerError) {
        setError(trackerError.message);
        setLoading(false);
        return;
      }

      setEntries((trackerData || []) as TrackerHistoryRow[]);
      setLoading(false);
    }

    loadHistory();

    return () => {
      ignore = true;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Loading log history...
      </main>
    );
  }

  return (
    <>
      <Navbar profile={profile} />

      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(to_bottom_right,_#f8fbff,_#f8fafc,_#f0fdf4)] px-4 py-8 md:px-6">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                Log History
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Your workout history
              </h1>

              <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
                Review your saved tracker entries, including weight, trained
                muscle group, and optional progress images.
              </p>
            </div>

            <Link
              href="/dashboard#tracker"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Add New Log
            </Link>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
              {error}
            </div>
          )}

          {entries.length === 0 ? (
            <section className="rounded-[32px] border border-dashed border-slate-300 bg-white/75 p-8 text-center shadow-sm backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                No logs yet
              </h2>

              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Add your first tracker entry from the dashboard.
              </p>

              <Link
                href="/dashboard#tracker"
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Go to Tracker
              </Link>
            </section>
          ) : (
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {entries.map((entry) => (
                <article
                  key={entry.entry_date}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/80 shadow-sm backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/75"
                >
                  {entry.image_url ? (
                    <img
                      src={entry.image_url}
                      alt="Progress"
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-slate-100 text-sm font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      No image
                    </div>
                  )}

                  <div className="p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {formatDate(entry.entry_date)}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Weight
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                          {entry.weight_kg} kg
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Muscle
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                          {entry.muscle_part}
                        </p>
                      </div>
                    </div>

                    {entry.updated_at && (
                      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                        Last updated{" "}
                        {new Date(entry.updated_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
}