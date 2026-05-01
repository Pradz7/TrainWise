"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-slate-600 dark:text-slate-300">
          Loading...
        </main>
      }
    >
      <AuthForm />
    </Suspense>
  );
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode =
    searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkProfileAndRedirect(userId: string) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      return;
    }

    if (profile) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (mode === "register" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: name.trim(),
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (!data.user) {
          setError("Could not create your account.");
          return;
        }

        localStorage.setItem(
          "trainwise_user",
          JSON.stringify({
            id: data.user.id,
            name: name.trim(),
            email: cleanEmail,
          })
        );

        localStorage.setItem("trainwise_logged_in", "true");

        localStorage.removeItem("trainwise_profile");
        localStorage.removeItem("trainwise_profile_complete");

        router.push("/onboarding");
        return;
      }

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (!data.user) {
        setError("Could not log in.");
        return;
      }

      localStorage.setItem(
        "trainwise_user",
        JSON.stringify({
          id: data.user.id,
          name: data.user.user_metadata?.name || "",
          email: data.user.email || cleanEmail,
        })
      );

      localStorage.setItem("trainwise_logged_in", "true");

      await checkProfileAndRedirect(data.user.id);
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    const nextMode = mode === "register" ? "login" : "register";

    setMode(nextMode);
    setName("");
    setEmail("");
    setPassword("");
    setError("");

    router.replace(`/auth?mode=${nextMode}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
        <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/70 dark:text-blue-300">
          TrainWise
        </p>

        <h1 className="mt-5 text-3xl font-bold text-slate-900 dark:text-white">
          {mode === "register" ? "Create your account" : "Welcome back"}
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {mode === "register"
            ? "Register first, then complete your fitness profile."
            : "Login to continue to your dashboard."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {mode === "register" && (
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Name
              </span>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="input mt-1"
                placeholder="Enter your name"
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
            </span>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input mt-1"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Password
            </span>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input mt-1"
              placeholder="Enter password"
            />
          </label>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "register"
                ? "Register"
                : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={switchMode}
          className="mt-5 w-full bg-transparent text-sm font-medium text-blue-600 hover:underline dark:text-blue-300"
        >
          {mode === "register"
            ? "Already have an account? Login"
            : "No account yet? Register"}
        </button>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
          Supabase authentication is now connected. Register users complete
          onboarding before entering the dashboard.
        </p>
      </section>
    </main>
  );
}