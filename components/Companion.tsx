"use client";

import { motion } from "framer-motion";
import type { CompanionMood } from "@/types/optima";

type CompanionProps = {
  mood: CompanionMood;
  size?: "lg";
};

function DrainedFaceSvg({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 44 44" className={className} fill="currentColor">
      <ellipse cx="14" cy="21" rx="3.5" ry="2" />
      <path
        d="M10.5 18.5 Q14 21.5 17.5 18.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <ellipse cx="30" cy="21" rx="3.5" ry="2" />
      <path
        d="M26.5 18.5 Q30 21.5 33.5 18.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13 33 Q22 28 31 33"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const sparkleConfig = [
  { radius: 85, duration: 4.0, color: "bg-emerald-400", dotSize: 8, delay: 0.0, reverse: false },
  { radius: 100, duration: 6.5, color: "bg-cyan-400", dotSize: 6, delay: 1.0, reverse: true },
  { radius: 78, duration: 5.0, color: "bg-violet-400", dotSize: 8, delay: 2.0, reverse: false },
  { radius: 108, duration: 7.5, color: "bg-teal-400", dotSize: 4, delay: 0.8, reverse: false },
  { radius: 90, duration: 3.8, color: "bg-amber-400", dotSize: 6, delay: 1.7, reverse: true },
  { radius: 96, duration: 5.8, color: "bg-pink-400", dotSize: 4, delay: 3.0, reverse: false },
];

type MoodStyle = {
  glow: string;
  faceColor: string;
  faceGlow: string;
  orbitColor: string;
  message: string;
  mouth: string;
  lgMouth: string;
  aura: string;
  bob: number;
};

const moodStyles: Record<CompanionMood, MoodStyle> = {
  "Flourishing": {
    glow: "from-emerald-200/40 via-teal-100/20 to-transparent",
    faceColor: "#2d6a4f",
    faceGlow: "rgba(45,106,79,0.25)",
    orbitColor: "rgba(45,106,79,0.25)",
    message: "Walking in step with the Spirit today.",
    mouth: "h-3 w-8 rounded-b-full border-b-4 border-white/80",
    lgMouth: "h-6 w-16 rounded-b-full border-b-[6px] border-white/80",
    aura: "bg-emerald-500/15",
    bob: -7,
  },
  "Faithful": {
    glow: "from-indigo-200/30 via-blue-100/15 to-transparent",
    faceColor: "#3730a3",
    faceGlow: "rgba(55,48,163,0.22)",
    orbitColor: "rgba(55,48,163,0.22)",
    message: "Steady and present. God sees your faithfulness.",
    mouth: "h-1.5 w-8 rounded-full bg-white/70",
    lgMouth: "h-3 w-16 rounded-full bg-white/70",
    aura: "bg-indigo-400/12",
    bob: -4,
  },
  "Pressing On": {
    glow: "from-orange-200/30 via-amber-100/15 to-transparent",
    faceColor: "#bc4a2f",
    faceGlow: "rgba(188,74,47,0.22)",
    orbitColor: "rgba(188,74,47,0.22)",
    message: "He who began a good work will complete it.",
    mouth: "h-3 w-7 rounded-t-full border-t-4 border-white/80",
    lgMouth: "h-6 w-14 rounded-t-full border-t-[6px] border-white/80",
    aura: "bg-orange-400/15",
    bob: -2,
  },
  "Be Still": {
    glow: "from-stone-300/20 via-stone-200/10 to-transparent",
    faceColor: "#78716c",
    faceGlow: "rgba(120,113,108,0.18)",
    orbitColor: "rgba(120,113,108,0.18)",
    message: "Be still and know that I am God.",
    mouth: "",
    lgMouth: "",
    aura: "bg-stone-400/12",
    bob: -1,
  },
};

const ORBIT_SIZE = 220;
const CIRCLE_SIZE = 150;

export function Companion({ mood, size }: CompanionProps) {
  const style = moodStyles[mood];

  const faceStyle = {
    background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.18) 0%, ${style.faceColor} 100%)`,
  };

  if (size === "lg") {
    return (
      <motion.div
        className="relative flex w-full items-center justify-center"
        style={{ height: ORBIT_SIZE + 60 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Counter-rotating dashed outer ring */}
        <motion.div
          className="absolute rounded-full border-2 border-dashed"
          style={{ width: ORBIT_SIZE + 24, height: ORBIT_SIZE + 24, borderColor: style.orbitColor }}
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />

        {/* Pulsing main orbit ring */}
        <motion.div
          className="absolute rounded-full border"
          style={{ width: ORBIT_SIZE, height: ORBIT_SIZE, borderColor: style.orbitColor }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Inner orbit ring */}
        <motion.div
          className="absolute rounded-full border"
          style={{ width: ORBIT_SIZE * 0.72, height: ORBIT_SIZE * 0.72, borderColor: style.orbitColor }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Glow blob */}
        <motion.div
          className={`absolute rounded-full blur-3xl ${style.aura}`}
          style={{ width: CIRCLE_SIZE + 30, height: CIRCLE_SIZE + 30 }}
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.3, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Orbiting sparkle dots */}
        {sparkleConfig.map((s, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: "50%", top: "50%", width: 0, height: 0 }}
            animate={{ rotate: s.reverse ? [360, 0] : [0, 360] }}
            transition={{ duration: s.duration, repeat: Infinity, ease: "linear", delay: s.delay }}
          >
            <motion.span
              className={`absolute rounded-full ${s.color}`}
              style={{
                width: s.dotSize,
                height: s.dotSize,
                left: -(s.dotSize / 2),
                top: -(s.radius + s.dotSize / 2),
              }}
              animate={{ scale: [1, 1.7, 1], opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.35 }}
            />
          </motion.div>
        ))}

        {/* Face */}
        <motion.div
          className="relative z-10 flex items-center justify-center rounded-[3.5rem] text-white shadow-2xl"
          style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE, ...faceStyle, boxShadow: `0 12px 40px ${style.faceGlow}` }}
          animate={{ rotate: mood === "Flourishing" ? [0, -2, 2, 0] : [0, 0.5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {mood === "Be Still" ? (
            <DrainedFaceSvg className="h-16 w-16" />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-7">
                <span className="h-5 w-5 rounded-full bg-current" />
                <span className="h-5 w-5 rounded-full bg-current" />
              </div>
              <span className={style.lgMouth} />
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.07]">
      <div className={`absolute inset-0 bg-gradient-to-br ${style.glow}`} />
      <div className="relative flex items-center gap-4">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-[2rem] bg-stone-50 shadow-inner shadow-stone-200/60 dark:bg-white/10 dark:shadow-white/10">
          <div
            className="flex h-16 w-16 flex-col items-center justify-center gap-2 rounded-3xl text-white shadow-lg"
            style={{ ...faceStyle, boxShadow: `0 4px 20px ${style.faceGlow}` }}
          >
            {mood === "Be Still" ? (
              <DrainedFaceSvg className="h-9 w-9" />
            ) : (
              <>
                <div className="flex gap-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-current" />
                  <span className="h-2.5 w-2.5 rounded-full bg-current" />
                </div>
                <span className={style.mouth} />
              </>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-400 dark:text-white/45">Companion</p>
          <p className="mt-2 text-lg font-semibold text-stone-800 dark:text-white">{style.message}</p>
        </div>
      </div>
    </section>
  );
}
