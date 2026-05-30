"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Companion } from "./Companion";
import { categoryEmoji } from "@/lib/categoryConfig";
import type { Category, PinnedIntention } from "@/types/optima";

const pillarSubtleBg: Record<Category, string> = {
  Spiritual: "bg-violet-50",
  Mental: "bg-blue-50",
  Physical: "bg-emerald-50",
  Relational: "bg-pink-50",
  Stewardship: "bg-amber-50",
};

type Props = {
  intentions: PinnedIntention[];
  isPremium: boolean;
  onAdd: () => void;
  onRemove: (habitId: string) => void;
  onUpdateTime: (time: string) => void;
  onRequestNotifications: () => Promise<boolean>;
};

export function DailyIntentionCard({
  intentions,
  isPremium,
  onAdd,
  onRemove,
  onUpdateTime,
  onRequestNotifications,
}: Props) {
  const [notifPermission, setNotifPermission] = useState<"default" | "granted" | "denied">("granted");
  const [customTime, setCustomTime] = useState("19:00");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission as "default" | "granted" | "denied");
    }
  }, []);

  const atLimit = !isPremium && intentions.length >= 3;
  const showAddButton = !atLimit;

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "pm" : "am";
    const displayH = h % 12 || 12;
    return m === 0 ? `${displayH}${period}` : `${displayH}:${String(m).padStart(2, "0")}${period}`;
  };

  const handleRequestNotifications = async () => {
    setRequesting(true);
    await onRequestNotifications();
    if ("Notification" in window) {
      setNotifPermission(Notification.permission as "default" | "granted" | "denied");
    }
    setRequesting(false);
  };

  return (
    <div className="mb-2 w-full rounded-[2rem] border border-stone-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-forest-600 dark:text-emerald-400">
          ✦ Today&apos;s Intentions
        </p>
        {showAddButton && (
          <button
            type="button"
            onClick={onAdd}
            className="text-xs font-bold text-forest-600 dark:text-emerald-400"
          >
            + Add
          </button>
        )}
      </div>

      {/* Empty state */}
      {intentions.length === 0 && (
        <div className="flex flex-col items-center py-2">
          <Companion mood="Faithful" size="sm" />
          <p className="mt-3 text-center text-sm text-stone-500 dark:text-white/50">
            Set up to 3 habits to focus on today.
          </p>
          <p className="mt-1 text-center text-xs text-stone-400 dark:text-white/30">
            Opti will remind you throughout the day.
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-4 rounded-full bg-forest-700 px-5 py-3 text-sm font-bold text-white"
          >
            Set my intentions
          </button>
        </div>
      )}

      {/* Intentions list */}
      {intentions.length > 0 && (
        <>
          <div className="space-y-3">
            <AnimatePresence>
              {intentions.map((intention) => (
                <motion.div
                  key={intention.habitId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center gap-3 rounded-2xl border p-3 ${
                    intention.habitKind === "drain"
                      ? "border-rose-200 bg-rose-50 dark:border-rose-400/20 dark:bg-rose-500/10"
                      : "border-forest-200 bg-forest-50 dark:border-emerald-400/20 dark:bg-emerald-500/10"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${pillarSubtleBg[intention.category]}`}
                  >
                    {categoryEmoji[intention.category]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-stone-800 dark:text-white">
                      {intention.habitLabel}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <span className="text-[10px] text-stone-400">🕐</span>
                      {intention.reminderTimes.map((t) => (
                        <span
                          key={t}
                          className={`rounded px-1.5 py-0.5 text-[9px] ${
                            t === intention.customTime
                              ? "bg-forest-100 text-forest-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                              : "bg-stone-100 text-stone-500 dark:bg-white/10 dark:text-white/40"
                          }`}
                        >
                          {formatTime(t)}
                        </span>
                      ))}
                    </div>
                    <p
                      className={`mt-0.5 text-[9px] font-bold ${
                        intention.habitKind === "drain"
                          ? "text-rose-500"
                          : "text-forest-600 dark:text-emerald-400"
                      }`}
                    >
                      {intention.habitKind === "drain" ? "Seeking freedom" : "Building this habit"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(intention.habitId)}
                    className="shrink-0 text-lg text-stone-300 transition hover:text-stone-600 dark:text-white/20 dark:hover:text-white/60"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Custom reminder time */}
          <div className="mt-4 border-t border-stone-100 pt-4 dark:border-white/10">
            <p className="mb-2 text-[10px] uppercase tracking-wide text-stone-400 dark:text-white/30">
              Custom reminder time
            </p>
            <input
              type="time"
              value={customTime}
              onChange={(e) => {
                setCustomTime(e.target.value);
                onUpdateTime(e.target.value);
              }}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
            />
            <p className="mt-1 text-[10px] text-stone-400 dark:text-white/30">
              We&apos;ll also remind you at 8am and 12pm.
            </p>
          </div>
        </>
      )}

      {/* Notification permission prompt */}
      {notifPermission !== "granted" && intentions.length > 0 && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-400/20 dark:bg-amber-500/10">
          <span className="text-xl">🔔</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-stone-800 dark:text-white">Enable reminders</p>
            <p className="mt-0.5 text-[10px] text-stone-500 dark:text-white/50">
              Opti will notify you throughout the day.
            </p>
          </div>
          <button
            type="button"
            disabled={requesting}
            onClick={handleRequestNotifications}
            className="shrink-0 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
          >
            Enable
          </button>
        </div>
      )}

      {/* Premium upsell */}
      {atLimit && (
        <div className="mt-3 rounded-2xl border border-stone-200 bg-parchment-200 p-3 text-center dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-bold text-stone-700 dark:text-white">🔒 Want to track more?</p>
          <p className="mt-1 text-[10px] text-stone-500 dark:text-white/50">
            Unlock unlimited intentions with Premium.
          </p>
          <button
            type="button"
            onClick={() => alert("Premium coming soon!")}
            className="mt-2 text-xs font-bold text-forest-600 dark:text-emerald-400"
          >
            Learn about Premium
          </button>
        </div>
      )}
    </div>
  );
}
