"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Habit } from "@/types/optima";
import type { CategoryAccent } from "@/lib/categoryConfig";

const rhythmColors: Record<"daily" | "weekly" | "periodic", string> = {
  daily: "bg-forest-50 text-forest-600",
  weekly: "bg-blue-50 text-blue-600",
  periodic: "bg-amber-50 text-amber-600",
};

function Checkmark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <motion.path
        d="M5 12l5 5L20 7"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      />
    </svg>
  );
}

type CheckInHabitCardProps = {
  habit: Habit;
  isSelected: boolean;
  onToggle: (habitId: string) => void;
  categoryAccent: CategoryAccent;
  index?: number;
};

export function CheckInHabitCard({
  habit,
  isSelected,
  onToggle,
  categoryAccent,
  index = 0,
}: CheckInHabitCardProps) {
  const isDrain = habit.kind === "drain";
  const [insightOpen, setInsightOpen] = useState(false);

  const cardStyle = isDrain && isSelected
    ? { backgroundColor: "#fef2ee", borderColor: "#f9c4ad" }
    : { backgroundColor: "#ffffff", borderColor: "rgba(28,25,23,0.08)" };

  const circleStyle = isSelected
    ? isDrain
      ? {
          background: "#d4694a",
          boxShadow: "0 0 0 4px rgba(212,105,74,0.15)",
        }
      : {
          background: categoryAccent.accent,
          boxShadow: `0 0 0 4px ${categoryAccent.accent}26`,
        }
    : {
        border: "2px solid rgba(28,25,23,0.12)",
        backgroundColor: "rgba(28,25,23,0.02)",
      };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onToggle(habit.id)}
      className="relative cursor-pointer rounded-2xl border px-4 py-4 shadow-sm"
      style={{
        ...cardStyle,
        minHeight: "72px",
        transition: "background-color 200ms ease, border-color 200ms ease",
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Flash overlay on check */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            key="flash"
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ backgroundColor: isDrain ? "#d4694a" : categoryAccent.accent }}
            initial={{ opacity: 0.12 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-start gap-3">
        {/* Check circle */}
        <div
          className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-200"
          style={circleStyle}
        >
          {isSelected && <Checkmark />}
        </div>

        {/* Text block */}
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-bold leading-5 transition-colors duration-200"
            style={
              isSelected
                ? { color: isDrain ? "#bc4a2f" : categoryAccent.accent }
                : { color: "#292524" }
            }
          >
            {habit.label}
          </p>
          {habit.description && (
            <p className="mt-0.5 text-xs leading-relaxed text-stone-400">
              {habit.description}
            </p>
          )}
          {habit.scriptureRef && (
            <p className="mt-0.5 text-[10px] italic text-stone-400">
              — {habit.scriptureRef}
            </p>
          )}
          {habit.rhythm && (
            <span
              className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${rhythmColors[habit.rhythm]}`}
            >
              {habit.rhythm}
            </span>
          )}
          {habit.insight && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInsightOpen((o) => !o);
              }}
              className="mt-1 block text-[10px] text-stone-300 transition hover:text-amber-600"
            >
              💡 why this?
            </button>
          )}
          <AnimatePresence>
            {insightOpen && habit.insight && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="mt-2 overflow-hidden rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs italic leading-5 text-amber-800"
              >
                {habit.insight}
              </motion.p>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isDrain && isSelected && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="mt-1 overflow-hidden text-[10px] italic text-stone-400"
              >
                Named and brought to God. That&apos;s what repentance looks like.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* XP badge */}
        <div className="mt-0.5 shrink-0">
          <AnimatePresence mode="wait">
            {isSelected ? (
              <motion.span
                key="checked"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ type: "tween", duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                className="block rounded-full px-2 py-1 text-[11px] font-black"
                style={
                  isDrain
                    ? {
                        background: "#fef2ee",
                        color: "#bc4a2f",
                        border: "1px solid #f9c4ad",
                      }
                    : {
                        background: categoryAccent.bg,
                        color: categoryAccent.accent,
                        border: `1px solid ${categoryAccent.border}`,
                      }
                }
              >
                {isDrain
                  ? `−${Math.abs(habit.points)}`
                  : `+${habit.points} XP`}
              </motion.span>
            ) : (
              <motion.span
                key="unchecked"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="block font-mono text-xs text-stone-300"
              >
                {habit.points > 0 ? `+${habit.points}` : `${habit.points}`}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
