"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Category, PinnedIntention } from "@/types/optima";

const intentionDotColor: Record<Category, string> = {
  Spiritual:   "bg-violet-400",
  Mental:      "bg-blue-400",
  Physical:    "bg-emerald-400",
  Relational:  "bg-pink-400",
  Stewardship: "bg-amber-400",
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
  const [showCustomTime, setShowCustomTime] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission as "default" | "granted" | "denied");
    }
  }, []);

  const atLimit = !isPremium && intentions.length >= 3;
  const canAdd = !atLimit;

  const formatTimeShort = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "p" : "a";
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
    <div className="w-full rounded-2xl border border-stone-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
      {intentions.length === 0 ? (
        /* Empty state — compact inline row */
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-base text-forest-600 dark:text-emerald-400">✦</span>
            <div>
              <p className="text-xs font-bold text-stone-700 dark:text-white">Today&apos;s intentions</p>
              <p className="mt-0.5 text-[10px] text-stone-400 dark:text-white/30">Set up to 3 habits to focus on</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="shrink-0 rounded-full bg-forest-700 px-3 py-1.5 text-[10px] font-bold text-white"
          >
            + Set
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-widest text-forest-600 dark:text-emerald-400">
              ✦ Today&apos;s Intentions
            </p>
            {canAdd && (
              <button
                type="button"
                onClick={onAdd}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-50 text-sm font-bold text-forest-600 dark:bg-emerald-500/20 dark:text-emerald-400"
              >
                +
              </button>
            )}
          </div>

          {/* Intention rows */}
          <AnimatePresence>
            {intentions.map((intention) => {
              const dot = intentionDotColor[intention.category];
              const times = intention.reminderTimes.map(formatTimeShort).join(" · ");
              return (
                <motion.div
                  key={intention.habitId}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2.5 border-b border-stone-50 py-1.5 last:border-0 dark:border-white/5"
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-stone-700 dark:text-white">
                      {intention.habitLabel}
                    </p>
                    <p className="text-[9px] text-stone-400 dark:text-white/30">{times}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(intention.habitId)}
                    className="shrink-0 text-sm text-stone-300 transition hover:text-stone-500 dark:text-white/20 dark:hover:text-white/50"
                  >
                    ×
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Custom time (collapsible) */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowCustomTime((v) => !v)}
              className="text-[9px] text-stone-400 underline dark:text-white/30"
            >
              {showCustomTime ? "Hide" : "Set custom reminder time"}
            </button>
            {showCustomTime && (
              <div className="mt-2">
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => {
                    setCustomTime(e.target.value);
                    onUpdateTime(e.target.value);
                  }}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
                />
                <p className="mt-1 text-[9px] text-stone-400 dark:text-white/30">Also reminds at 8a and 12p.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Notification permission — only when needed */}
      {notifPermission !== "granted" && intentions.length > 0 && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-400/20 dark:bg-amber-500/10">
          <p className="text-[10px] text-stone-700 dark:text-white">Enable reminders</p>
          <button
            type="button"
            disabled={requesting}
            onClick={handleRequestNotifications}
            className="shrink-0 rounded-full bg-amber-600 px-2.5 py-1 text-[9px] font-bold text-white disabled:opacity-60"
          >
            Enable
          </button>
        </div>
      )}

      {/* Premium upsell */}
      {atLimit && (
        <p className="mt-3 text-center text-[9px] text-stone-400 dark:text-white/30">
          🔒{" "}
          <button
            type="button"
            onClick={() => alert("Premium coming soon!")}
            className="font-bold text-forest-600 underline dark:text-emerald-400"
          >
            Unlock unlimited intentions
          </button>{" "}
          with Premium
        </p>
      )}
    </div>
  );
}
