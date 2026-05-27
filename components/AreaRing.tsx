"use client";

import { motion } from "framer-motion";

type AreaRingProps = {
  name: string;
  percent: number;
  color: string;
  delay?: number;
  isSelected?: boolean;
  onClick?: () => void;
};

const SIZE = 64;
const STROKE = 5;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export function AreaRing({
  name,
  percent,
  color,
  delay = 0,
  isSelected = false,
  onClick,
}: AreaRingProps) {
  const offset = CIRC * (1 - Math.min(100, Math.max(0, percent)) / 100);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 outline-none"
      whileTap={onClick ? { scale: 0.92 } : undefined}
      animate={{ scale: isSelected ? 1.08 : 1 }}
      transition={{ type: "tween", duration: 0.25 }}
    >
      <div
        className="relative transition-[filter] duration-300"
        style={{
          width: SIZE,
          height: SIZE,
          filter: isSelected ? `drop-shadow(0 0 8px ${color})` : undefined,
        }}
      >
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="rgba(28,25,23,0.08)"
            strokeWidth={STROKE}
          />
          {/* Selection glow ring — behind fill */}
          {isSelected && (
            <motion.circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={color}
              strokeWidth={STROKE + 5}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              initial={{ strokeOpacity: 0 }}
              animate={{ strokeOpacity: [0.12, 0.28, 0.12] }}
              transition={{ type: "tween", duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          {/* Fill */}
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: "spring", stiffness: 55, damping: 13, delay }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-[0.62rem] font-black tabular-nums"
          style={{ color }}
        >
          {percent}%
        </span>
      </div>
      <span
        className="text-[0.6rem] font-semibold text-stone-500 transition-colors duration-200 dark:text-white/55"
        style={{ color: isSelected ? color : undefined }}
      >
        {name}
      </span>
    </motion.button>
  );
}
