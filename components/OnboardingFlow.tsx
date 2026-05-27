"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Companion } from "@/components/Companion";
import { categories } from "@/data/habits";
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

const screenMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.22 },
};

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

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const isSummary = step >= onboardingQuestions.length;
  const currentQuestion = onboardingQuestions[step];

  useEffect(() => {
    setSelectedOptions([]);
  }, [step]);

  const progress = isSummary
    ? 100
    : ((step + 1) / (onboardingQuestions.length + 1)) * 100;

  const focusAreas = useMemo(() => getFocusAreas(answers), [answers]);

  const companionMessage = isSummary
    ? "I see a few clear focus areas. Nothing here is a label — it's a starting point."
    : currentQuestion.companionMessage;

  const answerQuestion = (
    questionId: OnboardingQuestionId,
    answer: string | string[],
  ) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: answer,
    }));

    setStep((currentStep) =>
      Math.min(currentStep + 1, onboardingQuestions.length),
    );
  };

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option],
    );
  };

  return (
    <main className="min-h-screen bg-parchment-100 text-stone-900 dark:bg-[#07070a] dark:text-white">
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6">
        <motion.div {...screenMotion} className="space-y-5">
          <Companion mood="Faithful" />

          <div className="mt-4 rounded-3xl border border-stone-200 bg-white p-4 text-center shadow-md dark:border-white/10 dark:bg-white/[0.06]">
            <p className="text-sm leading-6 text-stone-600 dark:text-white/70">
              {companionMessage}
            </p>
          </div>

          <section className="rounded-[2.25rem] border border-stone-200 bg-white p-6 shadow-md dark:border-white/10 dark:bg-white/[0.07]">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-stone-100 dark:bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-forest-600 to-forest-400 dark:from-violet-300 dark:via-emerald-200 dark:to-cyan-200"
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>

              <span className="text-xs font-semibold text-stone-400 dark:text-white/45">
                {isSummary
                  ? "Summary"
                  : `${step + 1}/${onboardingQuestions.length}`}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {isSummary ? (
                <motion.div key="onboarding-summary" {...screenMotion}>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-forest-600 dark:text-emerald-200/60">
                    Your Focus Areas
                  </p>

                  <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-stone-900 dark:text-white">
                    Here are the areas Óptima will gently watch with you.
                  </h1>

                  <p className="mt-4 text-sm leading-6 text-stone-500 dark:text-white/60">
                    These are not weaknesses. They are the clearest places
                    where a small reset could help your day feel more aligned.
                  </p>

                  <div className="mt-5 space-y-3">
                    {focusAreas.map((area) => (
                      <article
                        key={area}
                        className="rounded-3xl border border-stone-200 bg-parchment-200 p-4 dark:border-white/10 dark:bg-black/20"
                      >
                        <p className="text-sm font-semibold text-stone-800 dark:text-white">
                          {area}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-white/50">
                          {focusAreaDescriptions[area]}
                        </p>
                      </article>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onComplete(answers)}
                    className="mt-6 w-full rounded-full bg-forest-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-forest-700/20 transition hover:bg-forest-800 dark:bg-white dark:text-zinc-950 dark:shadow-black/25 dark:hover:bg-emerald-100"
                  >
                    Enter Óptima
                  </button>
                </motion.div>
              ) : (
                <motion.div key={currentQuestion.id} {...screenMotion}>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-forest-600 dark:text-emerald-200/60">
                    {currentQuestion.eyebrow}
                  </p>

                  <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-stone-900 dark:text-white">
                    {currentQuestion.question}
                  </h1>

                  <div className="mt-5 grid gap-2">
                    {currentQuestion.options.map((option) => {
                      const isChosen = selectedOptions.includes(option);
                      if (currentQuestion.multiSelect) {
                        return (
                          <motion.button
                            key={option}
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleOption(option)}
                            className={`flex items-center justify-between rounded-3xl border p-4 text-left text-sm font-semibold transition ${
                              isChosen
                                ? "border-forest-400 bg-forest-50 text-forest-800 dark:border-emerald-400/50 dark:bg-emerald-200/10 dark:text-emerald-200"
                                : "border-stone-200 bg-white text-stone-700 hover:border-forest-300 hover:bg-forest-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:border-emerald-200/40 dark:hover:bg-emerald-200/10"
                            }`}
                          >
                            <span>{option}</span>
                            {isChosen && (
                              <span className="ml-2 shrink-0 text-forest-600 dark:text-emerald-400">
                                ✦
                              </span>
                            )}
                          </motion.button>
                        );
                      }
                      return (
                        <motion.button
                          key={option}
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            answerQuestion(currentQuestion.id, option)
                          }
                          className="rounded-3xl border border-stone-200 bg-white p-4 text-left text-sm font-semibold text-stone-700 transition hover:border-forest-300 hover:bg-forest-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:border-emerald-200/40 dark:hover:bg-emerald-200/10"
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
                      onClick={() =>
                        answerQuestion(currentQuestion.id, selectedOptions)
                      }
                      className="mt-4 w-full rounded-full bg-forest-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-forest-700/20 transition hover:bg-forest-800 disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:shadow-black/25 dark:hover:bg-emerald-100 dark:disabled:opacity-40"
                    >
                      Continue →
                    </button>
                  )}

                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setStep((currentStep) =>
                          Math.max(0, currentStep - 1),
                        )
                      }
                      className="mt-5 text-sm font-semibold text-stone-400 transition hover:text-stone-600 dark:text-white/45 dark:hover:text-white"
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
