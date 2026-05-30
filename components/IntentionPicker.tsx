"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { categories } from "@/data/habits";
import { categoryEmoji } from "@/lib/categoryConfig";
import type { Category, Habit, PinnedIntention } from "@/types/optima";

type Props = {
  allHabits: Habit[];
  currentIntentions: PinnedIntention[];
  onSelect: (habit: Habit) => void;
  onClose: () => void;
};

export function IntentionPicker({ allHabits, currentIntentions, onSelect, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"positive" | "drain">("positive");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const pinnedIds = new Set(currentIntentions.map((i) => i.habitId));

  const filtered = allHabits.filter((h) => {
    if (h.kind !== activeTab) return false;
    if (activeCategory !== "All" && h.category !== activeCategory) return false;
    if (search && !h.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const cats: (Category | "All")[] = ["All", ...categories];

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md rounded-t-[2rem] bg-white shadow-2xl dark:bg-[#111]"
        style={{ maxHeight: "85vh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-stone-200 dark:bg-white/20" />
        </div>

        <div className="px-5 pb-3 pt-2">
          <p className="font-serif text-xl font-bold text-stone-900 dark:text-white">
            What do you want to focus on today?
          </p>
          <p className="mt-1 text-sm text-stone-500 dark:text-white/50">
            Pick a practice to pursue or something you want freedom from.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 px-5 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("positive")}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              activeTab === "positive" ? "bg-forest-700 text-white" : "text-stone-500 dark:text-white/50"
            }`}
          >
            Practices
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("drain")}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              activeTab === "drain" ? "bg-forest-700 text-white" : "text-stone-500 dark:text-white/50"
            }`}
          >
            Seeking Freedom
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search habits..."
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 placeholder-stone-400 outline-none dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder-white/30"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto px-5 pb-3">
          {cats.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                activeCategory === cat
                  ? "bg-forest-700 text-white"
                  : "bg-stone-100 text-stone-600 dark:bg-white/10 dark:text-white/60"
              }`}
            >
              {cat === "All" ? "All" : `${categoryEmoji[cat as Category]} ${cat}`}
            </button>
          ))}
        </div>

        {/* Habits list */}
        <div className="overflow-y-auto px-5 pb-10" style={{ maxHeight: "45vh" }}>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-stone-400 dark:text-white/30">
              No habits match your search.
            </p>
          )}
          {filtered.map((habit) => {
            const isPinned = pinnedIds.has(habit.id);
            return (
              <button
                key={habit.id}
                type="button"
                disabled={isPinned}
                onClick={() => onSelect(habit)}
                className="flex w-full items-center gap-3 border-b border-stone-50 py-3 text-left transition hover:bg-stone-50 disabled:opacity-50 dark:border-white/5 dark:hover:bg-white/[0.04]"
              >
                <span className="text-lg">{categoryEmoji[habit.category]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-800 dark:text-white">{habit.label}</p>
                  {habit.scriptureRef && (
                    <p className="text-[10px] italic text-stone-400 dark:text-white/30">
                      — {habit.scriptureRef}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 text-xs font-bold ${
                    isPinned
                      ? "text-forest-500 dark:text-emerald-500"
                      : "text-forest-600 dark:text-emerald-400"
                  }`}
                >
                  {isPinned ? "✦ Pinned" : "Pin +"}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}
