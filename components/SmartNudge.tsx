"use client";

import { motion } from "framer-motion";
import { getTipForCategory } from "@/data/categoryTips";
import type { CategoryScore } from "@/types/optima";

const pillarColor: Record<string, string> = {
  Physical:    "#2d6a4f",
  Mental:      "#1e3a5f",
  Spiritual:   "#5b21b6",
  Stewardship: "#92400e",
  Relational:  "#9d174d",
};

type SmartNudgeProps = {
  categoryScores: CategoryScore[];
  onDismiss: () => void;
  onCheckIn: () => void;
};

export function SmartNudge({ categoryScores, onDismiss, onCheckIn }: SmartNudgeProps) {
  const sorted = [...categoryScores].sort(
    (a, b) => a.completionRate - b.completionRate,
  );
  const weakest = sorted[0];

  if (!weakest || weakest.completionRate >= 60) return null;

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86_400_000,
  );
  const tip = getTipForCategory(weakest.category, dayOfYear);
  if (!tip) return null;

  const color = pillarColor[weakest.category] ?? "#57534e";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-amber-400/20 dark:bg-amber-400/[0.04]"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span
            className="text-xs font-black uppercase tracking-widest"
            style={{ color }}
          >
            {weakest.category}
          </span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-stone-400 transition hover:text-stone-600 dark:text-white/30 dark:hover:text-white"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>

      {/* Nudge + why */}
      <p className="mt-2 font-serif text-base font-semibold text-stone-800 dark:text-white">{tip.nudge}</p>
      <p className="mt-1 text-xs italic text-stone-500 dark:text-white/50">{tip.why}</p>

      {/* Quick win */}
      <div className="mt-4 border-t border-stone-100 pt-4 dark:border-white/10">
        <p className="text-[0.6rem] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400/80">
          Quick win
        </p>
        <p className="mt-1 text-sm font-semibold text-stone-800 dark:text-white">{tip.quickWin}</p>
      </div>

      {/* Actions list */}
      <ul className="mt-3 space-y-2">
        {tip.actions.map((action, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600/60 dark:bg-amber-400/60" />
            <span className="text-xs leading-5 text-stone-500 dark:text-white/60">{action}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        type="button"
        onClick={onCheckIn}
        className="mt-4 w-full rounded-full bg-forest-600 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-forest-700 dark:border dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/20"
      >
        Go to Check-in →
      </button>
    </motion.div>
  );
}
