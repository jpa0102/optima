"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { getTipForCategory } from "@/data/categoryTips";
import { categoryConfig, categoryEmoji } from "@/lib/categoryConfig";
import type { Category, CategoryScore, Habit } from "@/types/optima";

const SHEET_SIZE = 120;
const SHEET_STROKE = 7;
const SHEET_R = (SHEET_SIZE - SHEET_STROKE) / 2;
const SHEET_CIRC = 2 * Math.PI * SHEET_R;

type CategorySheetProps = {
  category: Category;
  categoryScore: CategoryScore;
  habits: Habit[];
  selectedHabitIds: string[];
  onClose: () => void;
  onGoToCheckIn: () => void;
};

function sheetStatusConfig(rate: number) {
  if (rate === 0)  return { text: "Not started",  cls: "bg-stone-50 text-stone-400 border-stone-200" };
  if (rate < 50)   return { text: "Needs work",   cls: "bg-amber-50 text-amber-700 border-amber-200" };
  if (rate < 80)   return { text: "Building",     cls: "bg-blue-50 text-blue-700 border-blue-200" };
  return                   { text: "Optimized ✓", cls: "bg-forest-50 text-forest-700 border-forest-200" };
}

export function CategorySheet({
  category,
  categoryScore,
  habits,
  selectedHabitIds,
  onClose,
  onGoToCheckIn,
}: CategorySheetProps) {
  const cfg = categoryConfig[category];
  const emoji = categoryEmoji[category];

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  const tip = getTipForCategory(category, dayOfYear);

  const positiveHabits = habits.filter(
    (h) => h.category === category && h.kind === "positive",
  );
  const completed = positiveHabits.filter((h) => selectedHabitIds.includes(h.id));
  const missed = positiveHabits.filter((h) => !selectedHabitIds.includes(h.id));

  const { completionRate, completed: completedCount, total } = categoryScore;
  const status = sheetStatusConfig(completionRate);
  const dashOffset = SHEET_CIRC * (1 - completionRate / 100);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-h-[85vh] max-w-md overflow-y-auto rounded-t-[2rem] border-t border-stone-200 bg-white px-5 pb-28 pt-2 dark:border-white/10 dark:bg-[#0f0f13]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-5 mt-2 h-1 w-10 rounded-full bg-stone-200 dark:bg-white/20" />

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{emoji}</span>
            <h2 className="font-serif text-xl font-black text-stone-800 dark:text-white">{category}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition hover:text-stone-800 dark:bg-white/[0.08] dark:text-white/50 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Big ring */}
        <div className="flex flex-col items-center">
          <div className="relative" style={{ width: SHEET_SIZE, height: SHEET_SIZE }}>
            <svg width={SHEET_SIZE} height={SHEET_SIZE} className="-rotate-90">
              <circle
                cx={SHEET_SIZE / 2}
                cy={SHEET_SIZE / 2}
                r={SHEET_R}
                fill="none"
                stroke="rgba(28,25,23,0.08)"
                strokeWidth={SHEET_STROKE}
              />
              <motion.circle
                cx={SHEET_SIZE / 2}
                cy={SHEET_SIZE / 2}
                r={SHEET_R}
                fill="none"
                stroke={cfg.accent}
                strokeWidth={SHEET_STROKE}
                strokeLinecap="round"
                strokeDasharray={SHEET_CIRC}
                initial={{ strokeDashoffset: SHEET_CIRC }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ type: "spring", stiffness: 55, damping: 13, delay: 0.15 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-serif text-3xl font-black tabular-nums"
                style={{ color: cfg.accent }}
              >
                {completionRate}%
              </span>
            </div>
          </div>
          <p className="mt-3 text-sm text-stone-500 dark:text-white/50">
            {completedCount} of {total} habits completed
          </p>
          <span
            className={`mt-3 rounded-full border px-4 py-1.5 text-xs font-bold ${status.cls}`}
          >
            {status.text}
          </span>
        </div>

        {/* Habit breakdown header */}
        <p className="mb-3 mt-7 text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-white/30">
          Today&apos;s Habits
        </p>

        {/* Completed habits */}
        {completed.length > 0 && (
          <div>
            {completed.map((habit, i) => (
              <div
                key={habit.id}
                className={`flex items-start gap-3 py-2.5 ${
                  i < completed.length - 1 || missed.length > 0
                    ? "border-b border-stone-100 dark:border-white/[0.06]"
                    : ""
                }`}
              >
                <div
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: cfg.accent }}
                >
                  ✓
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold" style={{ color: cfg.accent }}>
                    {habit.label}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-400 dark:text-white/35">{habit.description}</p>
                </div>
                <span
                  className="shrink-0 text-[10px] font-bold"
                  style={{ color: cfg.accent }}
                >
                  +{habit.points} XP
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Missed habits */}
        {missed.length > 0 && (
          <div>
            <p className="mb-2 mt-4 text-[10px] uppercase tracking-widest text-stone-400 dark:text-white/25">
              Still available today
            </p>
            {missed.map((habit, i) => (
              <div
                key={habit.id}
                className={`flex items-start gap-3 py-2.5 ${
                  i < missed.length - 1 ? "border-b border-stone-100 dark:border-white/[0.06]" : ""
                }`}
              >
                <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-stone-200 dark:border-white/15" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-stone-500 dark:text-white/50">{habit.label}</p>
                  <p className="mt-0.5 text-xs text-stone-400 dark:text-white/25">{habit.description}</p>
                </div>
                <span className="shrink-0 text-[10px] text-stone-300 dark:text-white/25">
                  +{habit.points} XP
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Insight tip card */}
        {tip && (
          <div className="mt-6 rounded-[1.5rem] border border-amber-100 bg-amber-50 p-4 dark:border-[--cfg-border] dark:bg-[--cfg-bg]"
            style={{ borderColor: cfg.border, backgroundColor: cfg.bg }}
          >
            <p
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: cfg.accent }}
            >
              💡 Opti&apos;s tip
            </p>
            <p className="mt-2 font-serif text-base font-bold text-stone-800 dark:text-white">{tip.nudge}</p>
            <p className="mt-1 text-xs italic text-stone-500 dark:text-white/50">{tip.why}</p>
            <div className="my-3 border-t border-stone-100 dark:border-white/[0.08]" />
            <p className="text-[10px] uppercase text-amber-700 dark:text-amber-400/70">Quick win</p>
            <p className="mt-1 text-sm font-semibold text-stone-800 dark:text-white">{tip.quickWin}</p>
            <ul className="mt-2 space-y-1.5">
              {tip.actions.slice(0, 2).map((action, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="mt-2 h-1 w-1 shrink-0 rounded-full"
                    style={{ background: cfg.accent }}
                  />
                  <span className="text-xs leading-5 text-stone-500 dark:text-white/55">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onGoToCheckIn}
          className="mt-6 w-full rounded-full py-4 text-sm font-black text-white"
          style={{ background: cfg.accent }}
        >
          Log {category} habits →
        </motion.button>
      </motion.div>
    </>
  );
}
