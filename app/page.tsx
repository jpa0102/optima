"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { BottomNav, type NavTab } from "@/components/BottomNav";
import { Companion } from "@/components/Companion";
import { HabitButton } from "@/components/HabitButton";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { ReflectionCard } from "@/components/ReflectionCard";
import { StatCard } from "@/components/StatCard";
import { categories, habits, savedDays } from "@/data/habits";
import { buildScoreSummary } from "@/lib/scoring";
import type { Category, OnboardingAnswers } from "@/types/optima";

const ONBOARDING_COMPLETE_KEY = "optima_onboarding_completed";
const ONBOARDING_ANSWERS_KEY = "optima_onboarding_answers";

const starterHabitIds = [
  "prayed-reflected",
  "practiced-gratitude",
  "went-outside",
  "drank-enough-water",
  "worked-studied",
  "planned-tomorrow",
  "doomscrolled-heavily",
  "stayed-up-too-late",
];

const screenMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.22 },
};

type DailyState = {
  label: "Thriving" | "Steady" | "Recovering" | "Drained";
  message: string;
  glow: string;
};

const pillarOrder: Category[] = ["Physical", "Mental", "Spiritual", "Productivity", "Relational"];

const pillarStyles: Record<Category, { color: string; glow: string }> = {
  Physical: { color: "#34d399", glow: "rgba(52, 211, 153, 0.3)" },
  Mental: { color: "#60a5fa", glow: "rgba(96, 165, 250, 0.3)" },
  Spiritual: { color: "#c084fc", glow: "rgba(192, 132, 252, 0.3)" },
  Productivity: { color: "#f59e0b", glow: "rgba(245, 158, 11, 0.3)" },
  Relational: { color: "#f472b6", glow: "rgba(244, 114, 182, 0.3)" },
};

function getDailyState(score: number): DailyState {
  if (score >= 85) {
    return {
      label: "Thriving",
      message: "Opti is glowing with you. Notice what supported this rhythm and let it encourage you.",
      glow: "rgba(52, 211, 153, 0.38)",
    };
  }

  if (score >= 60) {
    return {
      label: "Steady",
      message: "Opti sees a grounded day with honest signals. This is a day you can build from.",
      glow: "rgba(251, 191, 36, 0.34)",
    };
  }

  if (score >= 40) {
    return {
      label: "Recovering",
      message: "Opti is staying close. Let’s reset with clarity and choose one gentle next step.",
      glow: "rgba(168, 85, 247, 0.34)",
    };
  }

  return {
    label: "Drained",
    message: "Opti is here for the low-energy days too. No shame — just care, honesty, and a smaller reset.",
    glow: "rgba(244, 114, 182, 0.34)",
  };
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>(starterHabitIds);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [companionReaction, setCompanionReaction] = useState<string | null>(null);

  const summary = useMemo(() => buildScoreSummary(selectedHabitIds), [selectedHabitIds]);
  const activeCompanionMessage = companionReaction ?? summary.companionMessage;
  const dailyState = getDailyState(summary.score);

  useEffect(() => {
    queueMicrotask(() => {
      setIsOnboardingComplete(window.localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true");
    });
  }, []);

  const completeOnboarding = (answers: OnboardingAnswers) => {
    window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    window.localStorage.setItem(ONBOARDING_ANSWERS_KEY, JSON.stringify(answers));
    setIsOnboardingComplete(true);
  };

  const resetOnboarding = () => {
    window.localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    window.localStorage.removeItem(ONBOARDING_ANSWERS_KEY);
    setIsResultVisible(false);
    setCompanionReaction(null);
    setActiveTab("home");
    setIsOnboardingComplete(false);
  };

  const toggleHabit = (habitId: string) => {
    const habit = habits.find((item) => item.id === habitId);

    setSelectedHabitIds((currentHabitIds) => {
      const isAlreadySelected = currentHabitIds.includes(habitId);

      if (habit) {
        setCompanionReaction(
          isAlreadySelected
            ? "Got it — we’ll only count what felt true today."
            : habit.kind === "drain"
              ? "Thanks for being honest. That signal helps us reset with clarity."
              : "I saw that. This is a day you can build from.",
        );
      }

      return isAlreadySelected
        ? currentHabitIds.filter((selectedId) => selectedId !== habitId)
        : [...currentHabitIds, habitId];
    });
  };

  const saveToday = () => {
    setCompanionReaction("Saved. Thanks for being honest with yourself today.");
    setIsResultVisible(true);
    setActiveTab("home");
  };

  const changeTab = (tab: NavTab) => {
    setIsResultVisible(false);
    setActiveTab(tab);
  };

  if (!isOnboardingComplete) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(124,58,237,0.2),_transparent_30%),linear-gradient(180deg,_#101014_0%,_#07070a_48%,_#020203_100%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-4 pt-5">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-200/60">Óptima</p>
            <p className="mt-1 text-sm text-white/45">A compassionate mirror for today.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetOnboarding}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[0.68rem] font-semibold text-white/42 transition hover:bg-white/10 hover:text-white"
            >
              Reset onboarding
            </button>
            <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs text-white/60">
              Today
            </div>
          </div>
        </header>

        <div className="flex-1 space-y-5">
          <AnimatePresence mode="wait">
            {isResultVisible ? (
              <motion.div key="result" {...screenMotion} className="space-y-5">
                <Companion mood={summary.rating.companionMood} message="Saved. Your reflection has a shape now." />
                <section className="rounded-[2.25rem] border border-emerald-200/20 bg-gradient-to-br from-emerald-300/16 via-white/[0.07] to-violet-300/10 p-6 shadow-2xl shadow-black/30">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-200/70">Today saved</p>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-6xl font-semibold tracking-tight text-white">{summary.score}</p>
                      <p className="text-sm font-medium text-white/45">out of 100</p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white">
                      {summary.rating.label}
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <StatCard label="Strongest area" value={summary.strongestArea} helper="Where support showed up most." />
                    <StatCard label="Growth area" value={summary.growthArea} helper="A gentle next place to care for." />
                  </div>
                  <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/35">Daily takeaway</p>
                    <p className="mt-2 text-sm leading-6 text-white/68">{summary.dailyTakeaway}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsResultVisible(false)}
                    className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/25 transition hover:bg-emerald-100"
                  >
                    Keep reflecting
                  </button>
                </section>
              </motion.div>
            ) : activeTab === "home" ? (
              <motion.div key="home" {...screenMotion} className="space-y-6 pb-2 text-center">
                <section className="relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-black/20 px-5 py-7 shadow-2xl shadow-black/40">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,_rgba(255,255,255,0.14),_transparent_28%),radial-gradient(circle_at_50%_48%,_rgba(16,185,129,0.16),_transparent_42%)]" />
                  <motion.div
                    className="absolute left-1/2 top-20 h-44 w-44 -translate-x-1/2 rounded-full blur-3xl"
                    style={{ backgroundColor: dailyState.glow }}
                    animate={{ opacity: [0.45, 0.85, 0.45], scale: [0.86, 1.12, 0.86] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                  />

                  <div className="relative mx-auto flex flex-col items-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-100/45">Opti is with you</p>
                    <div className="relative mt-6 grid h-56 w-56 place-items-center">
                      <motion.div
                        className="absolute inset-0 rounded-full border border-white/10"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                      >
                        <span className="absolute left-8 top-3 h-3 w-3 rounded-full bg-emerald-200 shadow-[0_0_18px_rgba(110,231,183,0.8)]" />
                        <span className="absolute bottom-6 right-10 h-2.5 w-2.5 rounded-full bg-violet-200 shadow-[0_0_18px_rgba(221,214,254,0.75)]" />
                      </motion.div>
                      <motion.div
                        className="absolute h-44 w-44 rounded-full border border-emerald-100/10 bg-white/[0.04]"
                        animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.65, 1, 0.65] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div
                        className="relative flex h-32 w-32 flex-col items-center justify-center gap-3 rounded-[2.5rem] bg-gradient-to-br from-emerald-100 via-amber-100 to-violet-100 text-zinc-950 shadow-2xl shadow-emerald-950/40"
                        animate={{ y: [0, -10, 0], rotate: [0, -2, 2, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <div className="flex gap-7">
                          <span className="h-3.5 w-3.5 rounded-full bg-current" />
                          <span className="h-3.5 w-3.5 rounded-full bg-current" />
                        </div>
                        <span
                          className={`h-4 w-12 ${
                            summary.score >= 85
                              ? "rounded-b-full border-b-4 border-zinc-950"
                              : summary.score >= 60
                                ? "rounded-full bg-zinc-950/80"
                                : "rounded-t-full border-t-4 border-zinc-950"
                          }`}
                        />
                        <span className="absolute -right-2 top-5 h-4 w-4 rounded-full bg-white/80 shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
                      </motion.div>
                    </div>

                    <motion.div
                      key={dailyState.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 rounded-full border border-white/10 bg-white/[0.08] px-5 py-2 text-sm font-semibold text-white"
                    >
                      {dailyState.label}
                    </motion.div>
                    <p className="mt-4 max-w-xs text-sm leading-6 text-white/62">{dailyState.message}</p>

                    <motion.div key={summary.score} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                      <p className="mt-7 text-6xl font-semibold tracking-tight text-white">{summary.score} / 100</p>
                      <p className="mt-2 text-base font-semibold text-white/56">{summary.rating.label}</p>
                    </motion.div>
                  </div>
                </section>

                <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 text-left shadow-xl shadow-black/25">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Five pillars</p>
                    <p className="text-xs font-medium text-white/40">Today’s shape</p>
                  </div>
                  <div className="space-y-4">
                    {pillarOrder.map((pillar) => {
                      const categoryScore = summary.categoryScores.find((score) => score.category === pillar);
                      const progress = categoryScore?.completionRate ?? 0;
                      const style = pillarStyles[pillar];

                      return (
                        <div key={pillar}>
                          <div className="mb-1.5 flex items-center justify-between text-sm">
                            <span className="font-semibold text-white">{pillar}</span>
                            <span className="text-xs text-white/42">
                              {categoryScore?.completed ?? 0}/{categoryScore?.total ?? 0}
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-white/10 p-0.5">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: style.color, boxShadow: `0 0 18px ${style.glow}` }}
                              initial={false}
                              animate={{ width: `${progress * 100}%` }}
                              transition={{ type: "spring", stiffness: 120, damping: 22 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <button
                  type="button"
                  onClick={() => setActiveTab("check-in")}
                  className="w-full rounded-[1.75rem] bg-gradient-to-r from-emerald-200 via-cyan-100 to-violet-200 px-6 py-4 text-base font-bold text-zinc-950 shadow-2xl shadow-emerald-950/30 transition hover:scale-[1.01] active:scale-[0.99]"
                >
                  Check in with Opti
                </button>
              </motion.div>
            ) : activeTab === "check-in" ? (
              <motion.div key="check-in" {...screenMotion} className="space-y-5">
                <Companion mood={summary.rating.companionMood} message={activeCompanionMessage} />
                <ReflectionCard title="Check in honestly" eyebrow="Daily actions">
                  <p className="mb-4 text-sm leading-6 text-white/58">
                    Tap what feels true. Helpful actions and drains both help Óptima understand the day.
                  </p>
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <div key={category}>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.26em] text-white/35">
                          {category}
                        </h3>
                        <div className="space-y-2">
                          {habits
                            .filter((habit) => habit.category === category)
                            .map((habit) => (
                              <HabitButton
                                key={habit.id}
                                habit={habit}
                                isSelected={selectedHabitIds.includes(habit.id)}
                                onToggle={toggleHabit}
                              />
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={saveToday}
                    className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/25 transition hover:bg-emerald-100"
                  >
                    Save Today
                  </button>
                </ReflectionCard>
              </motion.div>
            ) : (
              <motion.div key="history" {...screenMotion} className="space-y-5">
                <ReflectionCard title="Weekly rhythm" eyebrow="History">
                  <p className="mb-4 text-sm leading-6 text-white/58">
                    A soft look at recent days — not a verdict, just a pattern you can learn from.
                  </p>
                  <div className="space-y-3">
                    {savedDays.map((day) => (
                      <article key={day.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-white">{day.dateLabel}</p>
                            <p className="mt-1 text-xs leading-5 text-white/48">{day.reflection}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-white">{day.score} / 100</p>
                            <p className="text-xs text-white/45">{day.rating}</p>
                            <p className="mt-1 text-[0.68rem] text-white/35">
                              +{day.positiveActionsCount} actions · {day.drainsLoggedCount} drains
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </ReflectionCard>
                <button
                  type="button"
                  onClick={resetOnboarding}
                  className="mx-auto block rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/35 transition hover:bg-white/10 hover:text-white"
                >
                  Reset onboarding
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <BottomNav activeTab={activeTab} onTabChange={changeTab} />
      </div>
    </main>
  );
}
