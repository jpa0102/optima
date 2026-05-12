"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Companion } from "@/components/Companion";
import { categories } from "@/data/habits";
import { focusAreaDescriptions, onboardingQuestions } from "@/data/onboardingQuestions";
import type { Category, OnboardingAnswers, OnboardingQuestionId } from "@/types/optima";

type OnboardingFlowProps = {
  onComplete: (answers: OnboardingAnswers) => void;
};

const screenMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.22 },
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

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const isSummary = step >= onboardingQuestions.length;
  const currentQuestion = onboardingQuestions[step];
  const progress = isSummary ? 100 : ((step + 1) / (onboardingQuestions.length + 1)) * 100;
  const focusAreas = useMemo(() => getFocusAreas(answers), [answers]);

  const answerQuestion = (questionId: OnboardingQuestionId, answer: string) => {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [questionId]: answer }));
    setStep((currentStep) => Math.min(currentStep + 1, onboardingQuestions.length));
  };

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(124,58,237,0.2),_transparent_30%),linear-gradient(180deg,_#101014_0%,_#07070a_48%,_#020203_100%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6">
        <motion.div {...screenMotion} className="space-y-5">
          <Companion mood="steady" />

<div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.06] p-4 text-center shadow-lg shadow-black/20">
  <p className="text-sm leading-6 text-white/70">
    {isSummary
      ? "I see a few clear focus areas. Nothing here is a label — it’s a starting point."
      : currentQuestion.companionMessage}
       </p>
        </div>
          <section className="rounded-[2.25rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/30">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-300 via-emerald-200 to-cyan-200"
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
              <span className="text-xs font-semibold text-white/45">
                {isSummary ? "Summary" : `${step + 1}/${onboardingQuestions.length}`}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {isSummary ? (
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
                    onClick={() => onComplete(answers)}
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
                        onClick={() => answerQuestion(currentQuestion.id, option)}
                        className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 text-left text-sm font-semibold text-white transition hover:border-emerald-200/40 hover:bg-emerald-200/10"
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}
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
