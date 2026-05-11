"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { BottomNav, type NavTab } from "@/components/BottomNav";
import { Companion } from "@/components/Companion";
import { HabitButton } from "@/components/HabitButton";
import { ReflectionCard } from "@/components/ReflectionCard";
import { ScoreSummary } from "@/components/ScoreSummary";
import { StatCard } from "@/components/StatCard";
import { categories, habits, savedDays } from "@/data/habits";
import { buildScoreSummary } from "@/lib/scoring";
import type { Category, OnboardingAnswers, OnboardingQuestionId } from "@/types/optima";

const ONBOARDING_COMPLETE_KEY = "optima:onboarding-complete";
const ONBOARDING_ANSWERS_KEY = "optima:onboarding-answers";

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

type OnboardingQuestion = {
  id: OnboardingQuestionId;
  eyebrow: string;
  question: string;
  companionMessage: string;
  options: string[];
};

const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: "motivation",
    eyebrow: "First, your why",
    question: "What brings you to Óptima?",
    companionMessage: "I’ll use this to keep your reflection focused, not heavy.",
    options: [
      "Build better discipline",
      "Reduce doomscrolling",
      "Improve physical health",
      "Grow spiritually",
      "Be more productive",
      "Feel more balanced",
    ],
  },
  {
    id: "improvementArea",
    eyebrow: "Your focus",
    question: "Which area do you want to improve most?",
    companionMessage: "No pressure to fix everything. One clear focus is enough to begin.",
    options: ["Spiritual", "Mental", "Physical", "Relational", "Productivity"],
  },
  {
    id: "dayDisruptor",
    eyebrow: "Common drain",
    question: "What usually throws off your day?",
    companionMessage: "Thanks for being honest. Naming the pattern gives you more choice around it.",
    options: ["Poor sleep", "Too much scrolling", "Lust / porn", "Junk food", "Stress", "Isolation", "Lack of planning"],
  },
  {
    id: "optimalFeeling",
    eyebrow: "Your version of optimal",
    question: "What does an optimal day feel like to you?",
    companionMessage: "Optimal does not mean perfect. It means aligned enough to build from.",
    options: ["Peaceful", "Disciplined", "Productive", "Spiritually aligned", "Connected", "Balanced"],
  },
  {
    id: "communicationStyle",
    eyebrow: "Companion tone",
    question: "How should Óptima speak to you?",
    companionMessage: "I can be supportive in the style that helps you receive the truth.",
    options: ["Gentle", "Direct", "Coach-like", "Faith-centered", "Practical"],
  },
];

const screenMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.22 },
};

const focusAreaDescriptions: Record<Category, string> = {
  Spiritual: "Create small moments for prayer, gratitude, or alignment before the day gets loud.",
  Mental: "Protect attention and give your mind a little more space to breathe.",
  Physical: "Support your body with rest, hydration, movement, and honest recovery.",
  Relational: "Stay connected without forcing yourself to perform for everyone.",
  Productivity: "Make tomorrow easier with simple planning and one clear priority.",
};

function addAreaScore(scores: Record<Category, number>, area: Category, amount = 1) {
  scores[area] += amount;
}

function getFocusAreas(answers: OnboardingAnswers): Category[] {
  const scores: Record<Category, number> = {
    Spiritual: 0,
    Mental: 0,
    Physical: 0,
    Relational: 0,
    Productivity: 0,
  };

  const motivationMap: Record<string, Category> = {
    "Build better discipline": "Productivity",
    "Reduce doomscrolling": "Mental",
    "Improve physical health": "Physical",
    "Grow spiritually": "Spiritual",
    "Be more productive": "Productivity",
    "Feel more balanced": "Mental",
  };
  const disruptorMap: Record<string, Category> = {
    "Poor sleep": "Physical",
    "Too much scrolling": "Mental",
    "Lust / porn": "Mental",
    "Junk food": "Physical",
    Stress: "Mental",
    Isolation: "Relational",
    "Lack of planning": "Productivity",
  };
  const feelingMap: Record<string, Category> = {
    Peaceful: "Mental",
    Disciplined: "Productivity",
    Productive: "Productivity",
    "Spiritually aligned": "Spiritual",
    Connected: "Relational",
    Balanced: "Physical",
  };
  const toneMap: Record<string, Category> = {
    "Faith-centered": "Spiritual",
    Practical: "Productivity",
    "Coach-like": "Productivity",
    Gentle: "Mental",
    Direct: "Productivity",
  };

  if (answers.motivation && motivationMap[answers.motivation]) {
    addAreaScore(scores, motivationMap[answers.motivation]);
  }

  if (answers.improvementArea && categories.includes(answers.improvementArea as Category)) {
    addAreaScore(scores, answers.improvementArea as Category, 2);
  }

  if (answers.dayDisruptor && disruptorMap[answers.dayDisruptor]) {
    addAreaScore(scores, disruptorMap[answers.dayDisruptor]);
  }

  if (answers.optimalFeeling && feelingMap[answers.optimalFeeling]) {
    addAreaScore(scores, feelingMap[answers.optimalFeeling]);
  }

  if (answers.communicationStyle && toneMap[answers.communicationStyle]) {
    addAreaScore(scores, toneMap[answers.communicationStyle]);
  }

  return categories
    .map((category) => ({ category, score: scores[category] }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ category }) => category);
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>(starterHabitIds);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [hasLoadedOnboarding, setHasLoadedOnboarding] = useState(false);
  const [onboardingAnswers, setOnboardingAnswers] = useState<OnboardingAnswers>({});
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [companionReaction, setCompanionReaction] = useState<string | null>(null);

  const summary = useMemo(() => buildScoreSummary(selectedHabitIds), [selectedHabitIds]);
  const focusAreas = useMemo(() => getFocusAreas(onboardingAnswers), [onboardingAnswers]);
  const activeCompanionMessage = companionReaction ?? summary.companionMessage;
  const isOnboardingSummary = onboardingStep >= onboardingQuestions.length;
  const onboardingProgress = isOnboardingSummary
    ? 100
    : ((onboardingStep + 1) / (onboardingQuestions.length + 1)) * 100;

  useEffect(() => {
    queueMicrotask(() => {
      const storedCompletion = window.localStorage.getItem(ONBOARDING_COMPLETE_KEY);
      const storedAnswers = window.localStorage.getItem(ONBOARDING_ANSWERS_KEY);

      if (storedAnswers) {
        setOnboardingAnswers(JSON.parse(storedAnswers) as OnboardingAnswers);
      }

      setIsOnboarded(storedCompletion === "true");
      setHasLoadedOnboarding(true);
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedOnboarding) {
      return;
    }

    window.localStorage.setItem(ONBOARDING_ANSWERS_KEY, JSON.stringify(onboardingAnswers));
  }, [hasLoadedOnboarding, onboardingAnswers]);

  const completeOnboarding = () => {
    window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    window.localStorage.setItem(ONBOARDING_ANSWERS_KEY, JSON.stringify(onboardingAnswers));
    setIsOnboarded(true);
  };

  const resetOnboarding = () => {
    window.localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    window.localStorage.removeItem(ONBOARDING_ANSWERS_KEY);
    setOnboardingAnswers({});
    setOnboardingStep(0);
    setIsResultVisible(false);
    setActiveTab("home");
    setIsOnboarded(false);
  };

  const answerOnboardingQuestion = (questionId: OnboardingQuestionId, answer: string) => {
    setOnboardingAnswers((currentAnswers) => ({ ...currentAnswers, [questionId]: answer }));
    setOnboardingStep((step) => Math.min(step + 1, onboardingQuestions.length));
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

  if (!hasLoadedOnboarding) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#07070a] text-white">
        <p className="text-sm text-white/50">Preparing Óptima…</p>
      </main>
    );
  }

  if (!isOnboarded) {
    const currentQuestion = onboardingQuestions[onboardingStep];

    return (
      <main className="min-h-screen bg-[#07070a] text-white">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(124,58,237,0.2),_transparent_30%),linear-gradient(180deg,_#101014_0%,_#07070a_48%,_#020203_100%)]" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6">
          <motion.div {...screenMotion} className="space-y-5">
            <Companion
              mood="steady"
              message={
                isOnboardingSummary
                  ? "I see a few clear focus areas. Nothing here is a label — it’s a starting point."
                  : currentQuestion.companionMessage
              }
            />
            <section className="rounded-[2.25rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/30">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-300 via-emerald-200 to-cyan-200"
                    animate={{ width: `${onboardingProgress}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
                <span className="text-xs font-semibold text-white/45">
                  {isOnboardingSummary ? "Summary" : `${onboardingStep + 1}/${onboardingQuestions.length}`}
                </span>
              </div>

              <AnimatePresence mode="wait">
                {isOnboardingSummary ? (
                  <motion.div key="onboarding-summary" {...screenMotion}>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/60">
                      Your Focus Areas
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold leading-tight text-white">
                      Here are the areas Óptima will gently watch with you.
                    </h1>
                    <p className="mt-4 text-sm leading-6 text-white/62">
                      These are not weaknesses. They are the clearest places where a small reset could help your day feel more aligned.
                    </p>
                    <div className="mt-5 space-y-3">
                      {focusAreas.map((area) => (
                        <article key={area} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                          <p className="text-sm font-semibold text-white">{area}</p>
                          <p className="mt-1 text-xs leading-5 text-white/52">{focusAreaDescriptions[area]}</p>
                        </article>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={completeOnboarding}
                      className="mt-6 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/25 transition hover:bg-emerald-100"
                    >
                      Enter Óptima
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key={currentQuestion.id} {...screenMotion}>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/60">
                      {currentQuestion.eyebrow}
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold leading-tight text-white">{currentQuestion.question}</h1>
                    <div className="mt-5 grid gap-2">
                      {currentQuestion.options.map((option) => (
                        <motion.button
                          key={option}
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => answerOnboardingQuestion(currentQuestion.id, option)}
                          className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 text-left text-sm font-semibold text-white transition hover:border-emerald-200/40 hover:bg-emerald-200/10"
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                    {onboardingStep > 0 ? (
                      <button
                        type="button"
                        onClick={() => setOnboardingStep((step) => Math.max(0, step - 1))}
                        className="mt-5 text-sm font-semibold text-white/45 transition hover:text-white"
                      >
                        Back
                      </button>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </motion.div>
        </div>
      </main>
    );
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
          <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs text-white/60">
            Today
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
