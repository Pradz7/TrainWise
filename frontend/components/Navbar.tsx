"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types";
import ThemeToggle from "@/components/ThemeToggle";

type NavbarProps = {
  profile: UserProfile;
};

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

export default function Navbar({ profile }: NavbarProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId);

    if (!section) {
      router.push(`/dashboard#${sectionId}`);
      return;
    }

    const navbarOffset = 110;
    const sectionTop =
      section.getBoundingClientRect().top + window.scrollY - navbarOffset;

    window.scrollTo({
      top: sectionTop,
      behavior: "smooth",
    });

    window.history.replaceState(null, "", `/dashboard#${sectionId}`);
  }

  function scrollToTop() {
    router.push("/dashboard");

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      window.history.replaceState(null, "", "/dashboard");
    }, 50);
  }

  function closeProfileMenu() {
    setProfileMenuOpen(false);
  }

  return (
    <nav className="sticky top-4 z-50 mx-auto mt-4 w-[calc(100%-2rem)] max-w-6xl rounded-full border border-slate-200/80 bg-white/85 shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/80 dark:shadow-[0_12px_35px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between px-4 py-3 md:px-5">
        <button
          type="button"
          onClick={scrollToTop}
          className="flex items-center gap-3 rounded-full bg-transparent p-0 hover:translate-y-0"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-sm">
            T
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-lg font-bold leading-none text-slate-900 dark:text-white">
              TrainWise
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI Fitness Coach
            </p>
          </div>
        </button>

        <div className="hidden items-center rounded-full border border-slate-200 bg-slate-50/80 p-1 dark:border-slate-700 dark:bg-slate-900/80 md:flex">
          <button
            type="button"
            onClick={scrollToTop}
            className="rounded-full bg-transparent px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("overview")}
            className="rounded-full bg-transparent px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("plans")}
            className="rounded-full bg-transparent px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
          >
            Plans
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("tracker")}
            className="rounded-full bg-transparent px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
          >
            Tracker
          </button>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((current) => !current)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm ring-4 ring-blue-100 hover:bg-blue-700 dark:ring-blue-900/50"
              title="Open profile menu"
              aria-label="Open profile menu"
            >
              {getInitials(profile.name)}
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {profile.name || "User"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    TrainWise account
                  </p>
                </div>

                <div className="p-2">
                  <Link
                    href="/profile"
                    onClick={closeProfileMenu}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    Profile
                  </Link>

                  <Link
                    href="/saved-plans"
                    onClick={closeProfileMenu}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    Saved Plans
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      closeProfileMenu();
                      scrollToSection("tracker");
                    }}
                    className="block w-full rounded-xl bg-transparent px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    Tracker
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}