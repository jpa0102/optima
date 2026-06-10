"use client";

import { motion } from "framer-motion";
import { Companion } from "@/components/Companion";
import { categoryEmoji } from "@/lib/categoryConfig";
import type { Quest } from "@/types/optima";

type Props = {
  quest: Quest;
  reasonShown: string;
  swapsRemaining: number;
  onAccept: () => void;
  onSwap: () => void;
  onDecline: () => void;
};

const difficultyBadge: Record<Quest["difficulty"], string> = {
  gentle:      "bg-emerald-100 text-emerald-700",
  moderate:    "bg-amber-100 text-amber-700",
  challenging: "bg-rose-100 text-rose-700",
};

export function QuestAcceptanceModal({
  quest,
  reasonShown,
  swapsRemaining,
  onAccept,
  onSwap,
  onDecline,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-y-auto bg-parchment-100/95 px-6 py-10 backdrop-blur-md"
    >
      {/* Ambient glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="h-96 w-96 rounded-full bg-amber-300 blur-3xl" />
      </motion.div>

      <div className="relative flex w-full max-w-sm flex-col items-center">
        {/* Opti */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Companion mood="Flourishing" size="lg" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 max-w-[280px] rounded-2xl border border-stone-100 bg-white px-4 py-3 text-center shadow-sm"
        >
          <p className="font-serif text-sm italic text-stone-700">
            I picked something specifically for you today.
          </p>
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-amber-700"
        >
          ✦ Today&apos;s Quest
        </motion.p>

        {/* Quest card */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.45, type: "spring", stiffness: 260, damping: 28 }}
          className="relative mt-4 w-full rounded-[2rem] border-2 border-amber-200 bg-white p-6 shadow-lg"
        >
          <div className="absolute right-5 top-5">
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${difficultyBadge[quest.difficulty]}`}>
              {quest.difficulty}
            </span>
          </div>

          <h2 className="pr-20 font-serif text-2xl font-black leading-tight text-stone-900">
            {quest.title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-stone-600">{quest.description}</p>

          <div className="mt-4 border-t border-amber-100 pt-4">
            <p className="font-serif text-sm italic leading-6 text-stone-600">
              &ldquo;{quest.scriptureText}&rdquo;
            </p>
            <p className="mt-1 text-[10px] text-stone-400">— {quest.scriptureRef}</p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-amber-100 pt-4">
            <span className="text-sm font-semibold text-stone-600">
              ⏱ {quest.estimatedMinutes} min
            </span>
            <span className="text-lg font-black text-amber-600">
              +{quest.pointsReward} XP
            </span>
          </div>
        </motion.div>

        {/* Quest reason */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-3 px-2 text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Why this quest:
          </p>
          <p className="mx-auto mt-1 max-w-[300px] text-xs italic leading-5 text-stone-500">
            {reasonShown}
          </p>
        </motion.div>

        {/* Accept */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onAccept}
          className="mt-6 w-full rounded-full bg-amber-600 py-4 text-base font-black text-white shadow-md transition hover:bg-amber-700"
        >
          Accept this quest ✦
        </motion.button>

        {/* Secondary actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-4 flex items-center justify-center gap-6"
        >
          {swapsRemaining > 0 && (
            <button
              type="button"
              onClick={onSwap}
              className="text-xs font-bold text-forest-600 transition hover:text-forest-800"
            >
              Try a different quest
            </button>
          )}
          <button
            type="button"
            onClick={onDecline}
            className="text-xs text-stone-400 transition hover:text-stone-600"
          >
            Not today
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mx-auto mt-6 max-w-[280px] text-center text-[10px] text-stone-400"
        >
          Quests are optional — but they&apos;re how Opti helps you grow.
        </motion.p>
      </div>
    </motion.div>
  );
}
