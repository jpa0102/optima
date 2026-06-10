"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { categoryEmoji } from "@/lib/categoryConfig";
import type { DailyQuest, Quest } from "@/types/optima";

type Props = {
  quest: Quest;
  dailyQuest: DailyQuest;
  onStart: () => void;
  onComplete: () => void;
  onSkip: () => void;
};

const difficultyBadge: Record<Quest["difficulty"], string> = {
  gentle:      "bg-emerald-100 text-emerald-700",
  moderate:    "bg-amber-100 text-amber-700",
  challenging: "bg-rose-100 text-rose-700",
};

const pillarTextColor: Record<string, string> = {
  Spiritual:   "text-violet-600",
  Mental:      "text-blue-600",
  Physical:    "text-emerald-600",
  Relational:  "text-pink-600",
  Stewardship: "text-amber-700",
};

export function DailyQuestCard({ quest, dailyQuest, onStart, onComplete, onSkip }: Props) {
  const [showSteps, setShowSteps] = useState(false);
  const { status } = dailyQuest;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.35 }}
      className="relative mb-4 w-full overflow-hidden rounded-[2rem] border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-parchment-200 p-5 shadow-md"
    >
      {/* Ambient glow when available */}
      {status === "available" && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[2rem]"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ boxShadow: "inset 0 0 0 2px rgba(217,119,6,0.3)" }}
        />
      )}

      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
          ✦ Today&apos;s Quest
        </p>
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${difficultyBadge[quest.difficulty]}`}>
          {quest.difficulty}
        </span>
      </div>

      {/* Title */}
      <h2 className="font-serif text-xl font-black leading-tight text-stone-900">
        {quest.title}
      </h2>

      {/* Description */}
      <p className="mt-2 text-sm leading-6 text-stone-600">{quest.description}</p>

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={`text-xs font-bold ${pillarTextColor[quest.category] ?? "text-stone-600"}`}>
          {categoryEmoji[quest.category]} {quest.category}
        </span>
        <span className="text-stone-300">·</span>
        <span className="text-xs text-stone-500">
          ⏱ {quest.estimatedMinutes} min
        </span>
        <span className="text-stone-300">·</span>
        <span className="text-xs font-bold text-amber-700">
          +{quest.pointsReward} XP
        </span>
      </div>

      {/* Scripture */}
      <div className="mt-4 border-t border-amber-200/50 pt-3">
        <p className="font-serif text-xs italic leading-5 text-stone-600">
          &ldquo;{quest.scriptureText}&rdquo;
        </p>
        <p className="mt-1 text-[10px] text-stone-400">— {quest.scriptureRef}</p>
      </div>

      {/* Action area by status */}
      {status === "available" && (
        <button
          type="button"
          onClick={onStart}
          className="mt-4 w-full rounded-full bg-amber-600 py-3 text-sm font-black text-white transition hover:bg-amber-700"
        >
          Begin quest ✦
        </button>
      )}

      {status === "in_progress" && (
        <>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onComplete}
              className="flex-1 rounded-full bg-forest-600 py-3 text-sm font-black text-white transition hover:bg-forest-700"
            >
              I did it ✓
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-full border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-500 transition hover:border-stone-300"
            >
              Not yet
            </button>
          </div>

          {quest.steps && quest.steps.length > 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowSteps((v) => !v)}
                className="text-xs font-bold text-amber-700 underline"
              >
                {showSteps ? "Hide steps ↑" : "View steps ↓"}
              </button>
              {showSteps && (
                <motion.ol
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-2"
                >
                  {quest.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                        {i + 1}
                      </span>
                      <span className="text-xs leading-5 text-stone-600">{step}</span>
                    </li>
                  ))}
                </motion.ol>
              )}
            </div>
          )}
        </>
      )}

      {status === "completed" && (
        <div className="mt-3 rounded-2xl bg-forest-50 p-4 text-center">
          <p className="font-serif text-sm font-bold text-forest-700">✦ Quest complete</p>
          <p className="mt-2 text-xs italic leading-5 text-stone-600">
            {quest.completionMessage}
          </p>
          <span className="mt-2 inline-flex rounded-full bg-forest-100 px-3 py-1 text-[10px] font-bold text-forest-700">
            +{quest.pointsReward} XP earned
          </span>
        </div>
      )}

      {status === "skipped" && (
        <div className="mt-3 rounded-2xl bg-stone-50 p-3 text-center">
          <p className="text-xs italic text-stone-400">
            This quest is still here when you&apos;re ready.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-2 text-xs font-bold text-amber-700"
          >
            Take it on ↗
          </button>
        </div>
      )}
    </motion.div>
  );
}
