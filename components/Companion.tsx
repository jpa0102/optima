"use client";

import { motion } from "framer-motion";
import type { CompanionMood } from "@/types/optima";

type CompanionProps = {
  mood: CompanionMood;
  message?: string;
};

const moodStyles: Record<
  CompanionMood,
  { glow: string; face: string; aura: string; label: string; eyes: string; mouth: string; bob: number }
> = {
  bright: {
    glow: "from-emerald-300/55 via-teal-300/30 to-cyan-300/10",
    face: "bg-emerald-200 text-emerald-950",
    aura: "bg-emerald-300/35",
    label: "Energized",
    eyes: "h-3 w-3 rounded-full bg-current shadow-[18px_0_0_current]",
    mouth: "h-4 w-9 rounded-b-full border-b-4 border-emerald-950",
    bob: -7,
  },
  steady: {
    glow: "from-amber-200/45 via-orange-300/20 to-rose-300/10",
    face: "bg-amber-200 text-amber-950",
    aura: "bg-amber-300/25",
    label: "Thoughtful",
    eyes: "h-2.5 w-2.5 rounded-full bg-current shadow-[18px_0_0_current]",
    mouth: "h-1.5 w-9 rounded-full bg-amber-950/80",
    bob: -4,
  },
  tender: {
    glow: "from-violet-300/40 via-fuchsia-300/20 to-slate-500/10",
    face: "bg-violet-200 text-violet-950",
    aura: "bg-violet-300/25",
    label: "Recovering",
    eyes: "h-1.5 w-3 rounded-full bg-current shadow-[18px_0_0_current]",
    mouth: "h-3 w-7 rounded-t-full border-t-4 border-violet-950",
    bob: -2,
  },
};

export function Companion({ mood, message }: CompanionProps) {
  const style = moodStyles[mood];

  return (
    <motion.section
      layout
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/30"
      animate={{ scale: [1, 1.015, 1] }}
      transition={{ duration: 0.45 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${style.glow}`} />
      <motion.div
        className={`absolute left-8 top-8 h-20 w-20 rounded-full blur-2xl ${style.aura}`}
        animate={{ opacity: [0.35, 0.75, 0.35], scale: [0.9, 1.15, 0.9] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative flex items-center gap-4">
        <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-[2rem] bg-white/10 shadow-inner shadow-white/10">
          <motion.div
            className={`flex h-[4.5rem] w-[4.5rem] flex-col items-center justify-center gap-2 rounded-[1.7rem] ${style.face} shadow-lg shadow-black/20`}
            animate={{ y: [0, style.bob, 0], rotate: mood === "bright" ? [0, -2, 2, 0] : [0, 1, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className={style.eyes} />
            <span className={style.mouth} />
          </motion.div>
          <motion.span
            className="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-white/70"
            animate={{ scale: [1, 1.5, 1], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Óptima · {style.label}</p>
          <p className="mt-2 text-lg font-semibold leading-7 text-white">Your reflection companion is here.</p>
        </div>
      </div>
      {message ? (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mt-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 shadow-xl shadow-black/20"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/35">Óptima says</p>
          <p className="mt-2 text-sm font-medium leading-6 text-white/72">{message}</p>
        </motion.div>
      ) : null}
    </motion.section>
  );
}
