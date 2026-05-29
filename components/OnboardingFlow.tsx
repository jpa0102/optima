"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Companion } from "@/components/Companion";
import { categories } from "@/data/habits";
import { categoryEmoji } from "@/lib/categoryConfig";
import {
  focusAreaDescriptions,
  onboardingQuestions,
} from "@/data/onboardingQuestions";
import type {
  Category,
  OnboardingAnswers,
  OnboardingQuestionId,
} from "@/types/optima";

type OnboardingFlowProps = {
  onComplete: (answers: OnboardingAnswers) => void;
};

// ── Existing logic (unchanged) ──────────────────────────────────────────────

function addAreaScore(
  scores: Record<Category, number>,
  area: Category,
  amount = 1,
) {
  scores[area] += amount;
}

function scoreFromMap(
  value: string | string[] | undefined,
  map: Record<string, Category>,
  scores: Record<Category, number>,
  amount = 1,
) {
  if (!value) return;
  const values = Array.isArray(value) ? value : [value];
  for (const v of values) {
    if (map[v]) addAreaScore(scores, map[v], amount);
  }
}

function getFocusAreas(answers: OnboardingAnswers): Category[] {
  const scores: Record<Category, number> = {
    Spiritual: 0,
    Mental: 0,
    Physical: 0,
    Relational: 0,
    Stewardship: 0,
  };

  const motivationMap: Record<string, Category> = {
    "Build better discipline": "Stewardship",
    "Reduce doomscrolling": "Mental",
    "Improve physical health": "Physical",
    "Grow spiritually": "Spiritual",
    "Be more productive": "Stewardship",
    "Feel more balanced": "Mental",
  };

  const disruptorMap: Record<string, Category> = {
    "Poor sleep": "Physical",
    "Too much scrolling": "Mental",
    "Lust / porn": "Mental",
    "Junk food": "Physical",
    Stress: "Mental",
    Isolation: "Relational",
    "Lack of planning": "Stewardship",
  };

  const feelingMap: Record<string, Category> = {
    Peaceful: "Mental",
    Disciplined: "Stewardship",
    Productive: "Stewardship",
    "Spiritually aligned": "Spiritual",
    Connected: "Relational",
    Balanced: "Physical",
  };

  const toneMap: Record<string, Category> = {
    "Faith-centered": "Spiritual",
    Practical: "Stewardship",
    "Coach-like": "Stewardship",
    Gentle: "Mental",
    Direct: "Stewardship",
  };

  scoreFromMap(answers.motivation, motivationMap, scores);

  if (answers.improvementArea) {
    const areas = Array.isArray(answers.improvementArea)
      ? answers.improvementArea
      : [answers.improvementArea];
    for (const area of areas) {
      if (categories.includes(area as Category)) {
        addAreaScore(scores, area as Category, 2);
      }
    }
  }

  scoreFromMap(answers.dayDisruptor, disruptorMap, scores);
  scoreFromMap(answers.optimalFeeling, feelingMap, scores);
  scoreFromMap(answers.communicationStyle, toneMap, scores);

  return categories
    .map((category) => ({ category, score: scores[category] }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ category }) => category);
}

// ── Screen config ────────────────────────────────────────────────────────────

type OnboardingPhase = "intro" | "questions" | "summary";

const NUM_INTRO = 6;

const pillarRows = [
  { emoji: "🙏", name: "Spiritual" as const, verse: "Walk with God — Gen 5:24", dot: "#7c3aed" },
  { emoji: "🧠", name: "Mental" as const, verse: "Renew your mind — Rom 12:2", dot: "#1d4ed8" },
  { emoji: "💪", name: "Physical" as const, verse: "Honor God in your body — 1 Cor 6:19", dot: "#059669" },
  { emoji: "🤝", name: "Relational" as const, verse: "Love one another — John 13:34", dot: "#db2777" },
  { emoji: "⚡", name: "Stewardship" as const, verse: "Work as unto the Lord — Col 3:23", dot: "#d97706" },
];

// ── Main component ───────────────────────────────────────────────────────────

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [phase, setPhase] = useState<OnboardingPhase>("intro");
  const [introStep, setIntroStep] = useState(0);
  const [questionStep, setQuestionStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useEffect(() => {
    setSelectedOptions([]);
  }, [questionStep, phase]);

  const focusAreas = useMemo(() => getFocusAreas(answers), [answers]);

  // Progress
  const currentProgressStep =
    phase === "intro"
      ? introStep
      : phase === "questions"
        ? NUM_INTRO + questionStep
        : NUM_INTRO + onboardingQuestions.length;
  const totalProgressSteps = NUM_INTRO + onboardingQuestions.length;
  const progressPct = Math.min(100, (currentProgressStep / totalProgressSteps) * 100);
  const showProgress = phase !== "intro" || introStep >= 3;

  // Back
  const showBack = introStep > 0 || phase !== "intro";
  const handleBack = () => {
    if (phase === "summary") {
      setPhase("questions");
      setQuestionStep(onboardingQuestions.length - 1);
    } else if (phase === "questions") {
      if (questionStep === 0) {
        setPhase("intro");
        setIntroStep(NUM_INTRO - 1);
      } else {
        setQuestionStep((s) => s - 1);
      }
    } else {
      setIntroStep((s) => Math.max(0, s - 1));
    }
  };

  const advanceIntro = () => {
    if (introStep >= NUM_INTRO - 1) {
      setPhase("questions");
    } else {
      setIntroStep((s) => s + 1);
    }
  };

  const answerQuestion = (questionId: OnboardingQuestionId, answer: string | string[]) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    if (questionStep + 1 >= onboardingQuestions.length) {
      setPhase("summary");
    } else {
      setQuestionStep((s) => s + 1);
    }
  };

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    );
  };

  const screenKey =
    phase === "intro"
      ? `intro-${introStep}`
      : phase === "questions"
        ? `q-${questionStep}`
        : "summary";

  const bgClass = phase === "intro" && introStep === 3 ? "bg-amber-50" : "bg-parchment-100";
  const currentQuestion = onboardingQuestions[questionStep];

  return (
    <main className={`relative min-h-screen transition-colors duration-500 ${bgClass}`}>
      {/* Progress bar */}
      {showProgress && (
        <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-parchment-300 dark:bg-white/10">
          <motion.div
            className="h-full bg-forest-500"
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          />
        </div>
      )}

      {/* Back button */}
      <AnimatePresence>
        {showBack && (
          <motion.button
            key="back"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={handleBack}
            className="fixed left-5 top-4 z-50 text-base text-stone-400 transition hover:text-stone-700"
          >
            ←
          </motion.button>
        )}
      </AnimatePresence>

      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 pb-10 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={screenKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex w-full flex-1 flex-col"
          >

            {/* ── INTRO SCREENS ──────────────────────────────────────────── */}

            {phase === "intro" && introStep === 0 && (
              <div className="flex flex-1 flex-col items-center justify-between">
                {/* Top: large Opti */}
                <div className="flex flex-1 items-center justify-center">
                  <Companion mood="Flourishing" size="lg" />
                </div>

                {/* Bottom: text + CTA */}
                <div className="w-full text-center">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-forest-600">
                    ✦ MEET YOUR COMPANION
                  </p>
                  <h1 className="font-serif text-4xl font-black text-stone-900">
                    Hi, I&apos;m Opti.
                  </h1>
                  <p className="mt-3 text-center text-base leading-7 text-stone-500">
                    I&apos;ll be walking alongside you —{" "}
                    <br />
                    every single day.
                  </p>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={advanceIntro}
                    className="mt-8 w-full rounded-full bg-forest-700 py-4 text-base font-black text-white transition hover:bg-forest-800"
                  >
                    Hey Opti →
                  </motion.button>
                </div>
              </div>
            )}

            {phase === "intro" && introStep === 1 && (
              <div className="w-full">
                <div className="flex justify-center">
                  <Companion mood="Faithful" size="sm" />
                </div>
                <h2 className="mt-8 text-center font-serif text-2xl font-bold leading-9 text-stone-800">
                  Most people are living in five key areas of life — but can&apos;t see clearly
                  how they&apos;re actually doing.
                </h2>
                <div className="mt-6 space-y-3">
                  {[
                    { icon: "📊", text: "Most people rate themselves higher than they actually live." },
                    { icon: "🔍", text: "Blind spots in one area drag down every other area." },
                    { icon: "✦", text: "Awareness is the first step to change." },
                  ].map((card, i) => (
                    <motion.div
                      key={card.icon}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.2 }}
                      className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white px-4 py-3 shadow-sm"
                    >
                      <span className="text-xl">{card.icon}</span>
                      <p className="text-xs leading-5 text-stone-600">{card.text}</p>
                    </motion.div>
                  ))}
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={advanceIntro}
                  className="mt-8 w-full rounded-full bg-forest-700 py-4 text-base font-black text-white transition hover:bg-forest-800"
                >
                  That sounds like me →
                </motion.button>
              </div>
            )}

            {phase === "intro" && introStep === 2 && (
              <div className="w-full">
                {/* Speech bubble + Opti */}
                <div className="flex flex-col items-center">
                  <div className="rounded-2xl border border-stone-100 bg-white px-3 py-2 shadow-sm">
                    <p className="text-xs text-stone-600">
                      Let me show you the five areas...
                    </p>
                  </div>
                  <div className="mt-1">
                    <Companion mood="Flourishing" size="sm" />
                  </div>
                </div>

                <h2 className="mt-6 text-center font-serif text-3xl font-black text-stone-900">
                  A whole life before God.
                </h2>

                <div className="mt-5 space-y-2">
                  {pillarRows.map((p, i) => (
                    <motion.div
                      key={p.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 + 0.1 }}
                      className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white px-4 py-3 shadow-sm"
                    >
                      <span className="text-2xl">{p.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-black text-stone-800">{p.name}</p>
                        <p className="text-[10px] italic text-stone-400">{p.verse}</p>
                      </div>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: p.dot }}
                      />
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={advanceIntro}
                  className="mt-8 w-full rounded-full bg-forest-700 py-4 text-base font-black text-white transition hover:bg-forest-800"
                >
                  Show me how it works →
                </motion.button>
              </div>
            )}

            {phase === "intro" && introStep === 3 && (
              <div className="w-full">
                <div className="flex justify-center">
                  <motion.div
                    animate={{ opacity: [0.85, 1, 0.85], scale: [1, 1.04, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Companion mood="Pressing On" size="sm" />
                  </motion.div>
                </div>

                <div className="mt-8 px-2 text-center">
                  <p className="font-serif text-6xl leading-none text-amber-300/60">&ldquo;</p>
                  <p className="-mt-4 font-serif text-xl font-bold italic leading-8 text-stone-800">
                    What does it profit a man to gain the whole world and lose his soul?
                  </p>
                  <p className="mt-3 text-sm text-stone-400">— Mark 8:36</p>
                </div>

                <div className="mt-6 border-t border-amber-200 pt-6">
                  <p className="text-center text-sm leading-7 text-stone-600">
                    Most people optimize their career, their body, their finances — but neglect
                    the very life God designed them to live.
                  </p>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={advanceIntro}
                  className="mt-8 w-full rounded-full bg-amber-600 py-4 text-base font-black text-white transition hover:bg-amber-700"
                >
                  I want to change that →
                </motion.button>
              </div>
            )}

            {phase === "intro" && introStep === 4 && (
              <div className="w-full">
                <div className="flex justify-center">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Companion mood="Flourishing" size="sm" />
                  </motion.div>
                </div>

                <h2 className="mt-6 text-center font-serif text-4xl font-black text-stone-900">
                  I&apos;m not a checklist.
                </h2>
                <p className="mt-2 text-center font-serif text-2xl font-bold text-forest-600">
                  I&apos;m a mirror.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    {
                      icon: "🪞",
                      title: "Daily reflection",
                      body: "See clearly how you're stewarding every area of your life.",
                      iconCls: "",
                    },
                    {
                      icon: "✦",
                      title: "Breadth over perfection",
                      body: "One faithful act in each pillar is a good day. You don't need to do everything.",
                      iconCls: "text-forest-600",
                    },
                    {
                      icon: "🕊️",
                      title: "Grace, not guilt",
                      body: "Your score is a mirror — not a verdict. Not your worth before God.",
                      iconCls: "",
                    },
                  ].map((card, i) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.2 }}
                      className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`text-2xl ${card.iconCls}`}>{card.icon}</span>
                        <div>
                          <p className="font-bold text-stone-800">{card.title}</p>
                          <p className="mt-1 text-xs leading-5 text-stone-500">{card.body}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={advanceIntro}
                  className="mt-8 w-full rounded-full bg-forest-700 py-4 text-base font-black text-white transition hover:bg-forest-800"
                >
                  That&apos;s what I need →
                </motion.button>
              </div>
            )}

            {phase === "intro" && introStep === 5 && (
              <div className="w-full">
                <div className="flex justify-center">
                  <Companion mood="Flourishing" size="lg" />
                </div>

                <div className="mx-2 mt-4 rounded-[2rem] border border-stone-100 bg-white p-6 shadow-md">
                  <p className="text-center font-serif text-base font-semibold leading-8 text-stone-800">
                    When you fall short —<br />
                    and you will, because we all do —<br />
                    I won&apos;t shame you.
                  </p>
                  <p className="mt-4 text-center text-sm leading-7 text-stone-500">
                    Every morning is a new beginning.
                    <br />
                    Every day is a fresh start with God.
                  </p>
                  <p className="mt-4 text-center font-serif text-sm italic text-stone-500">
                    &ldquo;His mercies are new every morning.&rdquo;
                  </p>
                  <p className="mt-1 text-center text-[11px] text-stone-400">
                    — Lamentations 3:23
                  </p>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={advanceIntro}
                  className="mt-6 w-full rounded-full bg-forest-700 py-4 text-base font-black text-white transition hover:bg-forest-800"
                >
                  I&apos;m ready to begin →
                </motion.button>
              </div>
            )}

            {/* ── QUESTIONS PHASE ────────────────────────────────────────── */}

            {phase === "questions" && currentQuestion && (
              <div className="w-full">
                {/* Opti + speech bubble */}
                <div className="flex flex-col items-center">
                  <Companion mood="Faithful" size="sm" />
                  <div className="mx-auto mt-3 mb-4 max-w-[260px] rounded-2xl border border-stone-100 bg-white px-4 py-2 text-center shadow-sm">
                    <p className="text-xs text-stone-600">{currentQuestion.companionMessage}</p>
                  </div>
                </div>

                {/* Question card */}
                <div className="rounded-[2rem] border border-stone-100 bg-white p-6 shadow-md">
                  <p className="text-[10px] font-black uppercase tracking-widest text-forest-600">
                    {currentQuestion.eyebrow}
                  </p>
                  <h2 className="mt-2 font-serif text-2xl font-black leading-tight text-stone-900">
                    {currentQuestion.question}
                  </h2>

                  <div className="mt-5 space-y-2">
                    {currentQuestion.options.map((option) => {
                      const isChosen = selectedOptions.includes(option);
                      if (currentQuestion.multiSelect) {
                        return (
                          <motion.button
                            key={option}
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleOption(option)}
                            className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left text-sm font-semibold transition ${
                              isChosen
                                ? "border-forest-300 bg-forest-50 text-forest-800"
                                : "border-stone-200 bg-parchment-100 text-stone-700 hover:border-forest-200 hover:bg-forest-50"
                            }`}
                          >
                            <span>{option}</span>
                            {isChosen && (
                              <span className="ml-2 shrink-0 text-forest-600">✦</span>
                            )}
                          </motion.button>
                        );
                      }
                      return (
                        <motion.button
                          key={option}
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => answerQuestion(currentQuestion.id, option)}
                          className="w-full rounded-2xl border border-stone-200 bg-parchment-100 p-4 text-left text-sm font-semibold text-stone-700 transition hover:border-forest-200 hover:bg-forest-50"
                        >
                          {option}
                        </motion.button>
                      );
                    })}
                  </div>

                  {currentQuestion.multiSelect && (
                    <button
                      type="button"
                      disabled={selectedOptions.length === 0}
                      onClick={() => answerQuestion(currentQuestion.id, selectedOptions)}
                      className="mt-4 w-full rounded-full bg-forest-700 py-3 font-black text-white transition hover:bg-forest-800 disabled:opacity-40"
                    >
                      Continue →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── SUMMARY PHASE ──────────────────────────────────────────── */}

            {phase === "summary" && (
              <div className="w-full text-center">
                <div className="flex justify-center">
                  <Companion mood="Flourishing" size="lg" />
                </div>

                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-forest-600">
                  ✦ YOUR FOCUS AREAS
                </p>
                <h2 className="mt-2 font-serif text-2xl font-bold leading-8 text-stone-900">
                  Here&apos;s where God may be
                  <br />
                  inviting you to grow.
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Not because these define you — but because this is your starting point.
                </p>

                <div className="mt-6 space-y-3 text-left">
                  {focusAreas.map((area, i) => (
                    <motion.div
                      key={area}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.3 }}
                      className="flex items-center gap-4 rounded-[1.5rem] border border-stone-100 bg-white p-4 shadow-sm"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-parchment-200 text-2xl">
                        {categoryEmoji[area]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-stone-800">{area}</p>
                        <p className="mt-0.5 text-xs leading-5 text-stone-500">
                          {focusAreaDescriptions[area]}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <p className="mt-4 text-center text-xs italic text-stone-400">
                  These will guide your experience — you can always explore all five pillars.
                </p>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onComplete(answers)}
                  className="mt-6 w-full rounded-full bg-forest-700 py-4 text-base font-black text-white transition hover:bg-forest-800"
                >
                  Begin my walk with God ✦
                </motion.button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
