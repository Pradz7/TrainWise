"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

function formatValue(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getInitials(name: string) {
  if (!name.trim()) return "U";

  return name
    .trim()
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [email, setEmail] = useState("");
  const [loaded, setLoaded] = useState(false);
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

      setEmail(user.email || "");

      localStorage.setItem("trainwise_logged_in", "true");
      localStorage.setItem(
        "trainwise_user",
        JSON.stringify({
          id: user.id,
          name: user.user_metadata?.name || "",
          email: user.email || "",
        })
      );

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select(
          "name, age, sex, weight_kg, height_cm, goal, activity_level, diet_preference, equipment, training_days"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (ignore) return;

      if (profileError) {
        setError(profileError.message);
        setProfile(loadLocalProfileFallback());
        setLoaded(true);
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

      setLoaded(true);
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();

    localStorage.removeItem("trainwise_user");
    localStorage.removeItem("trainwise_logged_in");
    localStorage.removeItem("trainwise_profile");
    localStorage.removeItem("trainwise_profile_complete");
    localStorage.removeItem("trainwise_calendar_tracker");
    localStorage.removeItem("trainwise_chat_messages");

    router.push("/");
  }

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Loading profile...
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 md:px-6"
      suppressHydrationWarning
    >
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ← Back to Dashboard
          </Link>

          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
            {error}
          </div>
        )}

        <section className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white shadow-sm">
                {getInitials(profile.name)}
              </div>

              <div>
                <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/70 dark:text-blue-300">
                  Supabase Profile
                </p>

                <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {profile.name || "User"}
                </h1>

                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  {profile.age} years old • {formatValue(profile.goal)}
                </p>

                {email && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {email}
                  </p>
                )}
              </div>
            </div>

            <Link
              href="/onboarding"
              className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700"
            >
              Edit Profile
            </Link>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <ProfileCard label="Name" value={profile.name || "Not set"} />
          <ProfileCard label="Age" value={`${profile.age}`} />
          <ProfileCard label="Sex" value={formatValue(profile.sex)} />
          <ProfileCard label="Weight" value={`${profile.weight_kg} kg`} />
          <ProfileCard label="Height" value={`${profile.height_cm} cm`} />
          <ProfileCard label="Goal" value={formatValue(profile.goal)} />
          <ProfileCard
            label="Activity Level"
            value={formatValue(profile.activity_level)}
          />
          <ProfileCard
            label="Diet Preference"
            value={formatValue(profile.diet_preference)}
          />
          <ProfileCard
            label="Equipment"
            value={formatValue(profile.equipment)}
          />
          <ProfileCard
            label="Training Days"
            value={`${profile.training_days} days/week`}
          />
        </section>
      </div>
    </main>
  );
}

function ProfileCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}