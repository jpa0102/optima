"use client";

import { motion } from "framer-motion";

type PillarBarProps = {
  name: string;
  value: number;
  colorClass: string;
  glow: string;
  delay?: number;
};

export function PillarBar({ name, value, colorClass, glow, delay = 0 }: PillarBarProps) {
  const percent = Math.round(value * 100);

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay }}
    >
      <span className="w-[4.5rem] text-left text-xs font-semibold text-stone-500 dark:text-white/65">{name}</span>
      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-stone-100 dark:bg-white/10">
        <motion.div
          className={`relative h-full rounded-full ${colorClass}`}
          style={{ boxShadow: `0 0 18px ${glow}` }}
          initial={{ width: "0%" }}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 12, delay: delay + 0.1 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/45 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 0.65, delay: delay + 1.2, ease: "easeOut" }}
          />
        </motion.div>
      </div>
      <span className="w-10 text-right text-xs font-bold tabular-nums text-stone-500 dark:text-white/55">{percent}%</span>
    </motion.div>
  );
}
