"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { CompanionMood } from "@/types/optima";

type CompanionProps = {
  mood: CompanionMood;
  message?: string;
  size?: "sm" | "lg";
};

// Map semantic moods → image files + visual config
const moodConfig: Record<
  CompanionMood,
  { src: string; glow: string; orbitColor: string; sparkleColor: string; sparkles: boolean }
> = {
  "Flourishing": {
    src: "/opti/bright.png",
    glow: "rgba(251, 191, 36, 0.5)",
    orbitColor: "rgba(251, 191, 36, 0.6)",
    sparkleColor: "#fbbf24",
    sparkles: true,
  },
  "Faithful": {
    src: "/opti/steady.png",
    glow: "rgba(96, 165, 250, 0.4)",
    orbitColor: "rgba(96, 165, 250, 0.5)",
    sparkleColor: "#60a5fa",
    sparkles: false,
  },
  "Pressing On": {
    src: "/opti/tender.png",
    glow: "rgba(167, 139, 250, 0.35)",
    orbitColor: "rgba(167, 139, 250, 0.45)",
    sparkleColor: "#a78bfa",
    sparkles: false,
  },
  "Be Still": {
    src: "/opti/drained.png",
    glow: "rgba(148, 163, 184, 0.25)",
    orbitColor: "rgba(148, 163, 184, 0.3)",
    sparkleColor: "#94a3b8",
    sparkles: false,
  },
};

export function Companion({ mood, message, size = "sm" }: CompanionProps) {
  const config = moodConfig[mood];
  const isLarge = size === "lg";

  const characterSize = isLarge ? 160 : 90;
  const orbitSize = isLarge ? 220 : 130;
  const wrapperSize = isLarge ? 240 : 140;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center"
        style={{ width: wrapperSize, height: wrapperSize }}
      >
        {/* Outer pulsing glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${config.glow} 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ type: "tween", duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Rotating orbit ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: orbitSize,
            height: orbitSize,
            border: `1.5px solid ${config.orbitColor}`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        />

        {/* Sparkles on bright (Flourishing) mood */}
        {config.sparkles && (
          <>
            <Sparkle top="10%" left="15%" delay={0}   color={config.sparkleColor} />
            <Sparkle top="20%" right="10%" delay={0.6} color={config.sparkleColor} />
            <Sparkle bottom="20%" left="10%" delay={1.2} color={config.sparkleColor} />
            <Sparkle bottom="15%" right="15%" delay={1.8} color={config.sparkleColor} />
          </>
        )}

        {/* One subtle sparkle for Be Still */}
        {mood === "Be Still" && (
          <Sparkle top="15%" right="15%" delay={2} color={config.sparkleColor} size={4} />
        )}

        {/* Opti character image */}
        <motion.div
          className="relative z-10"
          style={{
            width: characterSize,
            height: characterSize,
            filter: `drop-shadow(0 0 24px ${config.glow})`,
          }}
          animate={{ y: [0, -6, 0] }}
          transition={{ type: "tween", duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={config.src}
            alt={`Opti — ${mood}`}
            width={characterSize}
            height={characterSize}
            priority
            className="w-full h-full object-contain"
          />
        </motion.div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-4 max-w-[260px] rounded-2xl bg-white border border-stone-100 px-4 py-3 text-center shadow-sm"
        >
          <p className="text-xs leading-5 text-stone-600 italic font-serif">{message}</p>
        </motion.div>
      )}
    </div>
  );
}

function Sparkle({
  top,
  bottom,
  left,
  right,
  delay = 0,
  color = "#fbbf24",
  size = 6,
}: {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  delay?: number;
  color?: string;
  size?: number;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ top, bottom, left, right }}
      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 180, 360] }}
      transition={{ type: "tween", duration: 2.4, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width={size * 2} height={size * 2} viewBox="0 0 12 12" fill="none">
        <path d="M6 0L7 5L12 6L7 7L6 12L5 7L0 6L5 5Z" fill={color} />
      </svg>
    </motion.div>
  );
}
