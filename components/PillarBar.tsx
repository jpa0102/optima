"use client";

import { motion } from "framer-motion";

type PillarBarProps = {
  name: string;
  value: number;
  colorClass: string;
  glow: string;
};

export function PillarBar({ name, value, colorClass, glow }: PillarBarProps) {
  const percent = Math.round(value * 100);

  return (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.055] px-3 py-2.5 shadow-lg shadow-black/15">
      <span className="w-20 text-left text-xs font-semibold text-white/78">{name}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/35 p-0.5">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          style={{ boxShadow: `0 0 18px ${glow}` }}
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
        />
      </div>
      <span className="w-9 text-right text-xs font-bold text-white/62">{percent}</span>
    </div>
  );
}
