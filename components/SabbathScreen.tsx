"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  sabbathInvitations,
  sabbathOpeningMessages,
  sabbathClosingBlessings,
  SABBATH_CATEGORIES,
} from "@/data/sabbathInvitations";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function ChangeSabbathDialog({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<number>(
    parseInt(window.localStorage.getItem("optima_sabbath_day") ?? "0", 10),
  );

  function handleSelect(day: number) {
    setSelected(day);
    window.localStorage.setItem("optima_sabbath_day", String(day));
    window.location.reload();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: "tween", duration: 0.2 }}
        className="w-full max-w-[320px] rounded-3xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center font-serif text-base font-bold text-stone-800">
          Your Sabbath day is set to{" "}
          <span className="text-amber-600">{DAY_NAMES[selected]}</span>.
        </p>
        <p className="mt-1 text-center text-xs text-stone-400">Change it?</p>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {DAY_NAMES.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => handleSelect(i)}
              className={`rounded-xl py-2 text-xs font-bold transition ${
                selected === i
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-amber-100"
              }`}
            >
              {name.slice(0, 3)}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-center text-xs text-stone-400 hover:text-stone-600 transition"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}

export function SabbathScreen() {
  const [showDialog, setShowDialog] = useState(false);

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const messageIndex = dayOfYear % sabbathOpeningMessages.length;
  const blessingIndex = new Date().getDay() % sabbathClosingBlessings.length;

  let cardIndex = 0;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-parchment-100 flex flex-col items-center px-6 pt-10 pb-12">
        {/* Change Sabbath day button — top right */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 3, duration: 0.6 }}
          type="button"
          onClick={() => setShowDialog(true)}
          className="absolute top-6 right-6 text-[10px] text-stone-400 hover:text-stone-600 transition underline-offset-2 underline"
        >
          Change Sabbath day
        </motion.button>

        {/* ── TOP SECTION ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "tween", duration: 0.8 }}
          className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6 shadow-lg shadow-amber-200/40"
        >
          <motion.span
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, type: "tween", ease: "easeInOut" }}
            className="text-amber-600 text-3xl"
          >
            ✦
          </motion.span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700 mb-2"
        >
          {sabbathOpeningMessages[messageIndex]}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="font-serif font-black text-4xl text-stone-900 text-center leading-tight tracking-tight"
        >
          It&rsquo;s your Sabbath day.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <p className="text-base italic font-serif text-stone-500 leading-7 text-center mt-5 max-w-[300px]">
            &ldquo;Six days you shall labor, but the seventh is a Sabbath to the Lord your God.&rdquo;
          </p>
          <p className="text-xs text-stone-400 text-center mt-2">— Exodus 20:9–10</p>
        </motion.div>

        {/* ── DIVIDER ───────────────────────────────── */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 60 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="h-px bg-amber-300 mt-8 mb-6"
        />

        {/* ── INVITATIONS SECTION ───────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="text-stone-600 text-sm font-serif italic text-center mb-2 max-w-[280px]"
        >
          Here are some ways to honor your rest day:
        </motion.p>

        {SABBATH_CATEGORIES.map((category) => {
          const items = sabbathInvitations.filter((inv) => inv.category === category);
          return (
            <div key={category} className="mt-6 w-full max-w-[340px]">
              {/* Category header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-700">
                  {category}
                </span>
                <span className="flex-1 h-px bg-amber-200/60 ml-1" />
              </div>

              {/* Invitation cards */}
              {items.map((invitation) => {
                const delay = 1.5 + cardIndex * 0.08;
                cardIndex += 1;
                return (
                  <motion.div
                    key={invitation.title}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay, duration: 0.4, type: "tween" }}
                    className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 mb-2 flex items-start gap-3"
                  >
                    <span className="text-2xl flex-shrink-0">{invitation.icon}</span>
                    <div className="flex-1">
                      <p className="font-serif font-bold text-sm text-stone-800 leading-snug">
                        {invitation.title}
                      </p>
                      <p className="text-xs text-stone-500 mt-1 leading-5">
                        {invitation.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          );
        })}

        {/* ── CLOSING BLESSING ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="mt-10 mb-6 px-4 w-full max-w-[300px]"
        >
          <div className="flex items-center justify-center mb-4">
            <span className="text-amber-400 text-xs tracking-[0.6em]">✦ ✦ ✦</span>
          </div>
          <p className="text-stone-600 font-serif italic text-base text-center leading-7">
            {sabbathClosingBlessings[blessingIndex]}
          </p>
        </motion.div>

        {/* ── SABBATH NOTE ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8, duration: 0.6 }}
          className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 mt-2 text-center max-w-[300px]"
        >
          <p className="text-xs font-bold text-amber-700">Your streak is safe.</p>
          <p className="text-[11px] text-stone-500 italic mt-1 leading-5">
            Rest is not absence — it is obedience.
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {showDialog && <ChangeSabbathDialog onClose={() => setShowDialog(false)} />}
      </AnimatePresence>
    </>
  );
}
