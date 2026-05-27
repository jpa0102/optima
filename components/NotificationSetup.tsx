"use client";

import { motion } from "framer-motion";
import {
  NOTIF_PERMISSION_KEY,
  requestNotificationPermission,
} from "@/lib/notifications";

type NotificationSetupProps = {
  onComplete: () => void;
};

export function NotificationSetup({ onComplete }: NotificationSetupProps) {
  const handleEnable = async () => {
    await requestNotificationPermission();
    localStorage.setItem(NOTIF_PERMISSION_KEY, "asked");
    onComplete();
  };

  const handleDismiss = () => {
    localStorage.setItem(NOTIF_PERMISSION_KEY, "asked");
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full rounded-[2rem] border border-amber-200/60 bg-amber-50 p-4 dark:border-violet-400/20 dark:bg-violet-400/[0.05]"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">🔔</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-stone-800 dark:text-white">Get daily reminders</p>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-white/50">
            Opti will nudge you when an area needs attention.
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleEnable}
          className="rounded-full bg-forest-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-forest-700 dark:border dark:border-violet-400/30 dark:bg-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/30"
        >
          Enable
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="px-4 py-2 text-xs text-stone-400 transition hover:text-stone-600 dark:text-white/30 dark:hover:text-white/60"
        >
          Not now
        </button>
      </div>
    </motion.div>
  );
}
