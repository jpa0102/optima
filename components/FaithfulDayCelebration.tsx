"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Companion } from "@/components/Companion";

type Props = {
  onClose: () => void;
  pillarsPresent: number;
  score: number;
};

const SPRING = [0.34, 1.56, 0.64, 1] as const;

const glowCircles = [
  { top: "10%",  left: "-10%", color: "bg-violet-300",  delay: 0 },
  { top: "15%",  right: "-10%", color: "bg-blue-300",   delay: 0.2 },
  { bottom: "20%", left: "-5%",  color: "bg-emerald-300", delay: 0.4 },
  { bottom: "25%", right: "-5%", color: "bg-pink-300",   delay: 0.6 },
  { top: "50%",  left: "35%",  color: "bg-amber-300",   delay: 0.8 },
];

const PARTICLE_COLORS = [
  "bg-violet-400",
  "bg-blue-400",
  "bg-emerald-400",
  "bg-pink-400",
  "bg-amber-400",
  "bg-violet-400",
  "bg-blue-400",
  "bg-emerald-400",
  "bg-pink-400",
  "bg-amber-400",
  "bg-violet-400",
  "bg-blue-400",
];

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  color: PARTICLE_COLORS[i],
  left: `${10 + Math.floor((i * 7.3 + 11) % 80)}%`,
  duration: 4 + (i % 4) * 0.75,
  delay: i * 0.3,
  sway: i % 2 === 0 ? 18 : -18,
}));

const pillarEmojis = ["🙏", "🧠", "💪", "🤝", "⚡"];

export function FaithfulDayCelebration({ onClose, score }: Props) {
  const [displayScore, setDisplayScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  // Start count-up once score section appears
  useEffect(() => {
    const timer = setTimeout(() => setShowScore(true), 3400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showScore) return;
    let current = 0;
    const target = score;
    const step = Math.max(1, Math.ceil(target / 30));
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setDisplayScore(current);
      if (current >= target) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [showScore, score]);

  // TODO: play celebration sound when sound is added
  useEffect(() => {
    // const audio = new Audio("/sounds/faithful-day.mp3");
    // audio.volume = 0.3;
    // audio.play().catch(() => {});
  }, []);

  function handleShare() {
    const text = "I walked with God in every area of my life today. ✦ Óptima";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "Óptima — A Faithful Day", text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, type: "tween" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden px-6 bg-parchment-100"
    >
      {/* ── BACKGROUND GLOW CIRCLES ─────────────────────────── */}
      {glowCircles.map((c, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ type: "tween", duration: 1.2, delay: c.delay }}
          className={`pointer-events-none absolute w-48 h-48 rounded-full blur-3xl ${c.color}`}
          style={{
            top: c.top,
            left: (c as { left?: string }).left,
            right: (c as { right?: string }).right,
            bottom: c.bottom,
          }}
        />
      ))}

      {/* ── RISING LIGHT PARTICLES ──────────────────────────── */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`pointer-events-none absolute w-2 h-2 rounded-full ${p.color}`}
          style={{ left: p.left, bottom: -20 }}
          initial={{ opacity: 0, scale: 0.5, x: 0 }}
          animate={{
            bottom: ["−20px", "110vh"],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 1, 0.5],
            x: [0, p.sway, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
            repeat: 0,
          }}
        />
      ))}

      {/* ── OPTI ────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center">
        {/* Radiant pulse rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2 border-amber-300/30"
            style={{ width: 160, height: 160 }}
            animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ type: "tween", duration: 3, repeat: Infinity, delay: i }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { type: "tween", duration: 0.8, delay: 0.3 },
            scale: { duration: 0.8, delay: 0.3, ease: SPRING },
            y: { type: "tween", duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 1 },
          }}
        >
          <Companion mood="Flourishing" size="lg" />
        </motion.div>
      </div>

      {/* ── EYEBROW ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="text-[10px] font-black uppercase tracking-[0.4em] text-forest-600 text-center mt-6"
      >
        ✦ A FAITHFUL DAY ✦
      </motion.div>

      {/* ── MAIN HEADING ────────────────────────────────────── */}
      <motion.h1
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.6, type: "tween", ease: SPRING }}
        className="font-serif font-black text-4xl text-stone-900 text-center mt-3 leading-tight tracking-tight max-w-[320px]"
      >
        You showed up across your whole life today.
      </motion.h1>

      {/* ── SCRIPTURE ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9, duration: 0.6 }}
        className="mt-6 text-center max-w-[300px]"
      >
        <p className="font-serif italic text-base text-stone-600 leading-7">
          &ldquo;Well done, good and faithful servant. You have been faithful over a little; I will set you over much.&rdquo;
        </p>
        <p className="text-xs text-stone-400 mt-2">— Matthew 25:21</p>
      </motion.div>

      {/* ── FIVE PILLAR BLOOM ───────────────────────────────── */}
      <motion.div className="flex items-center justify-center gap-4 mt-8">
        {pillarEmojis.map((emoji, i) => (
          <motion.div
            key={emoji}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: [20, 0, -4, 0] }}
            transition={{
              delay: 2.2 + i * 0.15,
              duration: 0.5,
              type: "tween",
              ease: SPRING,
              y: {
                times: [0, 0.5, 0.75, 1],
                duration: 0.5,
                delay: 2.2 + i * 0.15,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: "easeInOut",
              },
            }}
            className="text-3xl"
          >
            {emoji}
          </motion.div>
        ))}
      </motion.div>

      {/* ── SCORE REVEAL ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.4, duration: 0.6 }}
        className="mt-8 text-center"
      >
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-1">
          TODAY&apos;S SCORE
        </p>
        <p className="font-serif font-black text-5xl text-forest-600">{displayScore}</p>
      </motion.div>

      {/* ── CLOSING BLESSING ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.5, duration: 0.8 }}
        className="mt-8 max-w-[280px] text-center"
      >
        <p className="font-serif italic text-sm text-forest-700 leading-7">
          He sees you. Keep walking. ✦
        </p>
      </motion.div>

      {/* ── AMEN BUTTON ─────────────────────────────────────── */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 5.0, duration: 0.6 }}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        onClick={onClose}
        className="mt-10 rounded-full bg-forest-700 hover:bg-forest-600 text-white px-8 py-4 font-black text-sm shadow-lg shadow-forest-700/20 transition-colors"
      >
        Amen ✦
      </motion.button>

      {/* ── SHARE OPTION ────────────────────────────────────── */}
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5.4, duration: 0.6 }}
        onClick={handleShare}
        className="mt-3 mb-8 text-xs text-stone-400 hover:text-stone-600 transition-colors"
      >
        Share this moment
      </motion.button>
    </motion.div>
  );
}
