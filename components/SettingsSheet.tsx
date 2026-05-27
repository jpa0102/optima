"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getSabbathDay, setSabbathDay } from "@/lib/gamification";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type SettingsSheetProps = {
  onClose: () => void;
};

export function SettingsSheet({ onClose }: SettingsSheetProps) {
  const [sabbathDay, setSabbathDayState] = useState<number>(() =>
    typeof window !== "undefined" ? getSabbathDay() : 0,
  );

  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("optima_theme") as "light" | "dark") || "light";
  });

  const handleSelectDay = (day: number) => {
    setSabbathDay(day);
    setSabbathDayState(day);
  };

  const handleThemeChange = (t: "light" | "dark") => {
    setCurrentTheme(t);
    localStorage.setItem("optima_theme", t);
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md rounded-t-[2rem] border-t border-stone-200 bg-white px-5 pb-10 pt-2 dark:border-white/10 dark:bg-[#0f0f13]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 mt-2 h-1 w-10 rounded-full bg-stone-200 dark:bg-white/20" />

        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg font-black text-stone-800 dark:text-white">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition hover:text-stone-800 dark:bg-white/[0.08] dark:text-white/50 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Theme toggle */}
        <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-white/30">
          Appearance
        </p>
        <div className="mb-6 flex overflow-hidden rounded-xl border border-stone-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => handleThemeChange("light")}
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-xs font-bold transition-colors ${
              currentTheme === "light"
                ? "bg-stone-100 text-stone-800 dark:bg-white/10 dark:text-white"
                : "text-stone-400 hover:text-stone-600 dark:text-white/30 dark:hover:text-white/60"
            }`}
          >
            ☀️ Light
          </button>
          <div className="w-px bg-stone-200 dark:bg-white/10" />
          <button
            type="button"
            onClick={() => handleThemeChange("dark")}
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-xs font-bold transition-colors ${
              currentTheme === "dark"
                ? "bg-stone-100 text-stone-800 dark:bg-white/10 dark:text-white"
                : "text-stone-400 hover:text-stone-600 dark:text-white/30 dark:hover:text-white/60"
            }`}
          >
            🌙 Dark
          </button>
        </div>

        {/* Sabbath day */}
        <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-white/30">
          Sabbath Day
        </p>
        <p className="mb-4 text-xs text-stone-500 dark:text-white/40">
          On your Sabbath, tracking is paused and your streak is protected.
        </p>

        <div className="flex gap-2">
          {DAYS.map((day, i) => (
            <button
              key={day}
              type="button"
              onClick={() => handleSelectDay(i)}
              className="flex-1 rounded-xl py-2.5 text-xs font-bold transition-colors"
              style={
                sabbathDay === i
                  ? {
                      background: "rgba(146,64,14,0.10)",
                      border: "1px solid rgba(146,64,14,0.30)",
                      color: "#92400e",
                    }
                  : {
                      background: "rgba(28,25,23,0.04)",
                      border: "1px solid rgba(28,25,23,0.10)",
                      color: "rgba(28,25,23,0.45)",
                    }
              }
            >
              {day}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}
