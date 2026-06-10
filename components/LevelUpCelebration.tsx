"use client";

import { motion } from "framer-motion";
import { Companion } from "@/components/Companion";
import type { Level } from "@/types/optima";

type Props = {
  oldLevel: Level;
  newLevel: Level;
  onClose: () => void;
};

const PARTICLES = [
  { dx: -18, dy: -36, delay: 0 },
  { dx: 20, dy: -44, delay: 0.15 },
  { dx: -8, dy: -52, delay: 0.3 },
  { dx: 30, dy: -30, delay: 0.1 },
  { dx: -32, dy: -28, delay: 0.25 },
  { dx: 8, dy: -56, delay: 0.45 },
];

export function LevelUpCelebration({ oldLevel, newLevel, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-parchment-100 px-6"
    >
      {/* Background glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="h-96 w-96 rounded-full blur-3xl"
          style={{ backgroundColor: newLevel.color }}
        />
      </motion.div>

      <div className="relative flex w-full max-w-sm flex-col items-center">
        {/* Opti with floating particles above */}
        <div className="relative">
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-0 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: newLevel.color, marginLeft: p.dx }}
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: [0, p.dy - 10, p.dy],
                opacity: [0, 1, 0],
              }}
              transition={{
                delay: p.delay,
                duration: 1.8,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: "easeOut",
              }}
            />
          ))}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Companion mood="Flourishing" size="lg" />
          </motion.div>
        </div>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4 mt-4 text-[10px] font-black uppercase tracking-[0.4em]"
          style={{ color: newLevel.color }}
        >
          ✦ You&apos;ve grown ✦
        </motion.p>

        {/* Level transition */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center"
        >
          <p className="text-sm text-stone-400 line-through opacity-50">
            Lv.{oldLevel.tier} · {oldLevel.title}
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-1 text-sm font-bold"
            style={{ color: newLevel.color }}
          >
            ↓
          </motion.p>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.0, type: "spring", stiffness: 200, damping: 18 }}
            className="mt-2 text-center"
          >
            <p className="text-sm font-bold" style={{ color: newLevel.color }}>
              Lv.{newLevel.tier}
            </p>
            <p
              className="font-serif text-5xl font-black leading-tight"
              style={{ color: newLevel.color }}
            >
              {newLevel.title}
            </p>
          </motion.div>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-6 text-center font-serif text-xl italic text-stone-700"
        >
          &ldquo;{newLevel.description}&rdquo;
        </motion.p>

        {/* Scripture */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mx-auto mt-6 max-w-[300px] text-center font-serif text-sm italic leading-7 text-stone-600"
        >
          {newLevel.scripture}
        </motion.p>

        {/* Closing message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="mx-auto mt-8 max-w-[280px] text-center font-serif text-sm italic text-forest-700"
        >
          Keep walking. He sees every step.
        </motion.p>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8 }}
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          className="mt-8 w-full max-w-[280px] rounded-full bg-forest-700 py-4 text-base font-black text-white transition hover:bg-forest-800"
        >
          Amen ✦
        </motion.button>
      </div>
    </motion.div>
  );
}
