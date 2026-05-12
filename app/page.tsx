"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { BottomNav, type NavTab } from "@/components/BottomNav";
import { Companion } from "@/components/Companion";
import { HabitButton } from "@/components/HabitButton";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { ReflectionCard } from "@/components/ReflectionCard";
import { ScoreSummary } from "@/components/ScoreSummary";
import { StatCard } from "@/components/StatCard";
import { categories, habits, savedDays } from "@/data/habits";
import { buildScoreSummary } from "@/lib/scoring";
import type { OnboardingAnswers } from "@/types/optima";

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

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>(starterHabitIds);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [companionReaction, setCompanionReaction] = useState<string | null>(null);

  const summary = useMemo(() => buildScoreSummary(selectedHabitIds), [selectedHabitIds]);
  const activeCompanionMessage = companionReaction ?? summary.companionMessage;

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
              <motion.div key="home" {...screenMotion} className="space-y-5">
                <Companion mood={summary.rating.companionMood} message={activeCompanionMessage} />
                <ScoreSummary summary={summary} />
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Momentum" value="4 days" helper="A gentle rhythm is forming." />
                  <StatCard label="Actions" value={`${summary.positiveActionsCount}`} helper="Supportive signals." />
                  <StatCard label="Drains" value={`${summary.drainsLoggedCount}`} helper="Logged with honesty." />
                </div>
                <ReflectionCard title="Category balance" eyebrow="Gentle scan">
                  <div className="space-y-3">
                    {summary.categoryScores.map((categoryScore) => (
                      <div key={categoryScore.category}>
                        <div className="mb-1 flex items-center justify-between text-xs text-white/50">
                          <span>{categoryScore.category}</span>
                          <span>
                            {categoryScore.completed}/{categoryScore.total}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <motion.div
                            className="h-full rounded-full bg-white/55"
                            animate={{ width: `${categoryScore.completionRate * 100}%` }}
                            transition={{ type: "spring", stiffness: 120, damping: 22 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </ReflectionCard>
                <ReflectionCard title="Today’s reflection" eyebrow="Gentle prompt">
                  <p className="text-sm leading-6 text-white/60">
                    What is one thing your day is asking you to notice without judging yourself for it?
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("check-in")}
                      className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                    >
                      Continue check-in
                    </button>
                    <button
                      type="button"
                      onClick={saveToday}
                      className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/25 transition hover:bg-emerald-100"
                    >
                      Save Today
                    </button>
                  </div>
                </ReflectionCard>
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
