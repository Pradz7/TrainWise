"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = localStorage.getItem("trainwise_theme");

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return "light";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("trainwise_theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      localStorage.setItem("trainwise_theme", nextTheme);
      return nextTheme;
    });
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="relative flex h-11 w-20 items-center rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/80 dark:hover:border-slate-600"
      suppressHydrationWarning
    >
      <span
        className={`absolute top-1 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-all duration-300 ${
          isDark ? "left-10" : "left-1"
        }`}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>

      <span className="flex w-full items-center justify-between px-2 text-slate-500 dark:text-slate-400">
        <span className="flex h-4 w-4 items-center justify-center">
          <SunIcon />
        </span>

        <span className="flex h-4 w-4 items-center justify-center">
          <MoonIcon />
        </span>
      </span>
    </button>
  );
}