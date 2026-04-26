"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type StoredUser = {
  name: string;
  email: string;
  password: string;
};

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-slate-600">
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter your email and password.");
      return;
    }

    if (mode === "register") {
      if (!name.trim()) {
        alert("Please enter your name.");
        return;
      }

      const user: StoredUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      };

      localStorage.setItem("trainwise_user", JSON.stringify(user));
      localStorage.setItem("trainwise_logged_in", "true");

      // Important:
      // Clear old profile data so a new registration starts fresh.
      localStorage.removeItem("trainwise_profile");
      localStorage.removeItem("trainwise_profile_complete");

      // Register users must complete onboarding first.
      router.push("/onboarding");
      return;
    }

    const savedUser = localStorage.getItem("trainwise_user");

    if (!savedUser) {
      alert("No account found. Please register first.");
      setMode("register");
      return;
    }

    const user = JSON.parse(savedUser) as StoredUser;

    if (
      user.email !== email.trim().toLowerCase() ||
      user.password !== password
    ) {
      alert("Incorrect email or password.");
      return;
    }

    localStorage.setItem("trainwise_logged_in", "true");

    // Login users go directly to dashboard.
    router.push("/dashboard");
  }

  function switchMode() {
    setMode((currentMode) =>
      currentMode === "register" ? "login" : "register"
    );

    setName("");
    setEmail("");
    setPassword("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-6">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          TrainWise
        </p>

        <h1 className="mt-5 text-3xl font-bold text-slate-900">
          {mode === "register" ? "Create your account" : "Welcome back"}
        </h1>

        <p className="mt-2 text-slate-600">
          {mode === "register"
            ? "Register first, then complete your fitness profile."
            : "Login to continue to your dashboard."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-sm font-medium text-slate-700">
                Name
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            {mode === "register" ? "Register" : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={switchMode}
          className="mt-5 w-full text-sm font-medium text-blue-600 hover:underline"
        >
          {mode === "register"
            ? "Already have an account? Login"
            : "No account yet? Register"}
        </button>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Demo login only. For production, connect real authentication later.
        </p>
      </section>
    </main>
  );
}