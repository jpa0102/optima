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
import {
  getDefaultProfile,
  saveUserProfile,
  STRUGGLE_LABELS,
} from "@/lib/userProfile";
import type {
  AgeRange,
  Category,
  CurrentStruggle,
  FaithStage,
  HasChildren,
  HealthConsideration,
  LifeSeason,
  OnboardingAnswers,
  OnboardingQuestionId,
  RelationshipStatus,
  UserProfile,
  WorkSituation,
} from "@/types/optima";

type OnboardingFlowProps = {
  onComplete: (answers: OnboardingAnswers) => void;
};

// ── Existing scoring logic ────────────────────────────────────────────────────

function addAreaScore(scores: Record<Category, number>, area: Category, amount = 1) {
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
    Spiritual: 0, Mental: 0, Physical: 0, Relational: 0, Stewardship: 0,
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
    "Poor sleep": "Physical", "Too much scrolling": "Mental",
    "Lust / porn": "Mental", "Junk food": "Physical",
    Stress: "Mental", Isolation: "Relational", "Lack of planning": "Stewardship",
  };
  const feelingMap: Record<string, Category> = {
    Peaceful: "Mental", Disciplined: "Stewardship", Productive: "Stewardship",
    "Spiritually aligned": "Spiritual", Connected: "Relational", Balanced: "Physical",
  };
  const toneMap: Record<string, Category> = {
    "Faith-centered": "Spiritual", Practical: "Stewardship",
    "Coach-like": "Stewardship", Gentle: "Mental", Direct: "Stewardship",
  };
  scoreFromMap(answers.motivation, motivationMap, scores);
  if (answers.improvementArea) {
    const areas = Array.isArray(answers.improvementArea) ? answers.improvementArea : [answers.improvementArea];
    for (const area of areas) {
      if (categories.includes(area as Category)) addAreaScore(scores, area as Category, 2);
    }
  }
  scoreFromMap(answers.dayDisruptor, disruptorMap, scores);
  scoreFromMap(answers.optimalFeeling, feelingMap, scores);
  scoreFromMap(answers.communicationStyle, toneMap, scores);
  return categories
    .map((category) => ({ category, score: scores[category] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ category }) => category);
}

// ── Profile question config ───────────────────────────────────────────────────

type ProfileQuestionConfig = {
  key: keyof Omit<UserProfile, "customHabitIds" | "hiddenHabitIds" | "pinnedHabitIds">;
  eyebrow: string;
  optiSpeech: string;
  question: string;
  multiSelect?: boolean;
  helperText?: string;
  options: Array<{ label: string; value: string }>;
};

const profileQuestions: ProfileQuestionConfig[] = [
  {
    key: "ageRange",
    eyebrow: "ABOUT YOU",
    optiSpeech: "Let's get to know you a bit.",
    question: "How old are you?",
    options: [
      { label: "Under 18", value: "under_18" },
      { label: "18–24", value: "18_24" },
      { label: "25–34", value: "25_34" },
      { label: "35–44", value: "35_44" },
      { label: "45–54", value: "45_54" },
      { label: "55–64", value: "55_64" },
      { label: "65 or older", value: "65_plus" },
      { label: "Prefer not to say", value: "25_34" },
    ],
  },
  {
    key: "workSituation",
    eyebrow: "WORK & PURPOSE",
    optiSpeech: "Your work shapes a big part of your day.",
    question: "What best describes your current work or season?",
    options: [
      { label: "Full-time work", value: "full_time_work" },
      { label: "Business owner / self-employed", value: "business_owner" },
      { label: "Part-time work", value: "part_time_work" },
      { label: "Student", value: "student" },
      { label: "Stay-at-home parent", value: "stay_at_home_parent" },
      { label: "Retired", value: "retired" },
      { label: "Between jobs", value: "between_jobs" },
      { label: "Full-time ministry", value: "ministry_full_time" },
    ],
  },
  {
    key: "relationshipStatus",
    eyebrow: "RELATIONSHIPS",
    optiSpeech: "I want to walk alongside the real you — wherever life has you right now.",
    question: "Which is closest to your current relationship status?",
    options: [
      { label: "Single", value: "single" },
      { label: "Dating", value: "dating" },
      { label: "Engaged", value: "engaged" },
      { label: "Married", value: "married" },
      { label: "Widowed", value: "widowed" },
      { label: "Prefer not to say", value: "prefer_not_to_say" },
    ],
  },
  {
    key: "hasChildren",
    eyebrow: "FAMILY",
    optiSpeech: "Your family shapes your rhythm.",
    question: "Do you have children at home?",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
    ],
  },
  {
    key: "healthConsideration",
    eyebrow: "PHYSICAL WELLBEING",
    optiSpeech: "I'll keep this in mind so I never push you in ways that aren't right for your body.",
    question: "Anything I should be aware of about your physical health?",
    options: [
      { label: "Nothing specific", value: "none" },
      { label: "Chronic illness", value: "chronic_illness" },
      { label: "Physical limitation / disability", value: "physical_limitation" },
      { label: "Recovering from addiction", value: "recovering_addiction" },
      { label: "Mental health considerations", value: "mental_health" },
      { label: "Pregnant or postpartum", value: "pregnant_postpartum" },
      { label: "Prefer not to say", value: "prefer_not_to_say" },
    ],
  },
  {
    key: "lifeSeason",
    eyebrow: "YOUR SEASON",
    optiSpeech: "Life has seasons. The same practices look different in different ones.",
    question: "What season of life are you in right now?",
    options: [
      { label: "Thriving — energy is high, things are good", value: "thriving" },
      { label: "Busy and full — moving fast, lots happening", value: "busy_full" },
      { label: "Transitioning — change is happening (new job, move, etc.)", value: "transitioning" },
      { label: "Quiet and steady — life is calm and even", value: "quiet_steady" },
      { label: "Hard season — facing real difficulty", value: "hard_season" },
      { label: "Grieving — walking through loss", value: "grieving" },
      { label: "Rebuilding — coming out of something hard", value: "rebuilding" },
    ],
  },
  {
    key: "faithStage",
    eyebrow: "FAITH JOURNEY",
    optiSpeech: "There's no wrong place to be — I'm walking with you regardless.",
    question: "Where are you in your walk with Jesus right now?",
    options: [
      { label: "Exploring — not sure yet, still learning who Jesus is", value: "exploring" },
      { label: "New believer — recently said yes to following Jesus", value: "new_believer" },
      { label: "Growing — committed but still building rhythms", value: "growing" },
      { label: "Established — consistent walk for years", value: "established" },
      { label: "Leading or mature — serving and mentoring others", value: "leader_or_mature" },
    ],
  },
  {
    key: "currentStruggles",
    eyebrow: "BE HONEST",
    optiSpeech: "This stays completely private. It just helps me know what you might want to bring before God.",
    question: "What are you wanting freedom from or growth in right now?",
    multiSelect: true,
    helperText: "These won't define you — they're just where Opti will help you focus.",
    options: Object.entries(STRUGGLE_LABELS).map(([value, label]) => ({ label, value })),
  },
];

const NUM_PROFILE = profileQuestions.length;

// ── Screen config ─────────────────────────────────────────────────────────────

type OnboardingPhase = "intro" | "questions" | "profile" | "summary";

const NUM_INTRO = 6;

const pillarRows = [
  { emoji: "🙏", name: "Spiritual" as const, verse: "Walk with God — Gen 5:24", dot: "#7c3aed" },
  { emoji: "🧠", name: "Mental" as const, verse: "Renew your mind — Rom 12:2", dot: "#1d4ed8" },
  { emoji: "💪", name: "Physical" as const, verse: "Honor God in your body — 1 Cor 6:19", dot: "#059669" },
  { emoji: "🤝", name: "Relational" as const, verse: "Love one another — John 13:34", dot: "#db2777" },
  { emoji: "⚡", name: "Stewardship" as const, verse: "Work as unto the Lord — Col 3:23", dot: "#d97706" },
];

// ── Main component ────────────────────────────────────────────────────────────

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [phase, setPhase] = useState<OnboardingPhase>("intro");
  const [introStep, setIntroStep] = useState(0);
  const [questionStep, setQuestionStep] = useState(0);
  const [profileStep, setProfileStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [profileAnswers, setProfileAnswers] = useState<Partial<UserProfile>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useEffect(() => {
    setSelectedOptions([]);
  }, [questionStep, profileStep, phase]);

  const focusAreas = useMemo(() => getFocusAreas(answers), [answers]);

  const currentQuestion = onboardingQuestions[questionStep];
  const currentProfileQuestion = profileQuestions[profileStep];

  // Progress
  const totalProgressSteps = NUM_INTRO + onboardingQuestions.length + NUM_PROFILE;
  const currentProgressStep =
    phase === "intro"
      ? introStep
      : phase === "questions"
        ? NUM_INTRO + questionStep
        : phase === "profile"
          ? NUM_INTRO + onboardingQuestions.length + profileStep
          : totalProgressSteps;
  const progressPct = Math.min(100, (currentProgressStep / totalProgressSteps) * 100);
  const showProgress = phase !== "intro" || introStep >= 3;

  // Back
  const showBack = introStep > 0 || phase !== "intro";
  const handleBack = () => {
    if (phase === "summary") {
      setPhase("profile");
      setProfileStep(NUM_PROFILE - 1);
    } else if (phase === "profile") {
      if (profileStep === 0) {
        setPhase("questions");
        setQuestionStep(onboardingQuestions.length - 1);
      } else {
        setProfileStep((s) => s - 1);
      }
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
      setPhase("profile");
    } else {
      setQuestionStep((s) => s + 1);
    }
  };

  const answerProfileQuestion = (key: string, value: string | string[]) => {
    const newProfile = { ...profileAnswers, [key]: value };
    setProfileAnswers(newProfile);
    if (profileStep + 1 >= NUM_PROFILE) {
      setPhase("summary");
    } else {
      setProfileStep((s) => s + 1);
    }
  };

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    );
  };

  const handleComplete = () => {
    const fullProfile: UserProfile = {
      ...getDefaultProfile(),
      ...profileAnswers,
    };
    saveUserProfile(fullProfile);
    try {
      localStorage.setItem("optima_profile_completed", "true");
    } catch {
      // ignore
    }
    onComplete(answers);
  };

  const screenKey =
    phase === "intro"
      ? `intro-${introStep}`
      : phase === "questions"
        ? `q-${questionStep}`
        : phase === "profile"
          ? `p-${profileStep}`
          : "summary";

  const bgClass = phase === "intro" && introStep === 3 ? "bg-amber-50" : "bg-parchment-100";

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
                <div className="flex flex-1 items-center justify-center">
                  <Companion mood="Flourishing" size="lg" />
                </div>
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
                <div className="flex flex-col items-center">
                  <div className="rounded-2xl border border-stone-100 bg-white px-3 py-2 shadow-sm">
                    <p className="text-xs text-stone-600">Let me show you the five areas...</p>
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
                      <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.dot }} />
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
                    { icon: "🪞", title: "Daily reflection", body: "See clearly how you're stewarding every area of your life." },
                    { icon: "✦", title: "Breadth over perfection", body: "One faithful act in each pillar is a good day.", iconCls: "text-forest-600" },
                    { icon: "🕊️", title: "Grace, not guilt", body: "Your score is a mirror — not a verdict. Not your worth before God." },
                  ].map((card, i) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.2 }}
                      className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`text-2xl ${"iconCls" in card ? card.iconCls : ""}`}>{card.icon}</span>
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
                  <p className="mt-1 text-center text-[11px] text-stone-400">— Lamentations 3:23</p>
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

            {/* ── ORIGINAL QUESTIONS PHASE ───────────────────────────────── */}

            {phase === "questions" && currentQuestion && (
              <div className="w-full">
                <div className="flex flex-col items-center">
                  <Companion mood="Faithful" size="sm" />
                  <div className="mx-auto mt-3 mb-4 max-w-[260px] rounded-2xl border border-stone-100 bg-white px-4 py-2 text-center shadow-sm">
                    <p className="text-xs text-stone-600">{currentQuestion.companionMessage}</p>
                  </div>
                </div>
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
                            {isChosen && <span className="ml-2 shrink-0 text-forest-600">✦</span>}
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

            {/* ── PROFILE PHASE ──────────────────────────────────────────── */}

            {phase === "profile" && currentProfileQuestion && (
              <div className="w-full">
                <div className="flex flex-col items-center">
                  <Companion mood="Faithful" size="sm" />
                  <div className="mx-auto mt-3 mb-4 max-w-[260px] rounded-2xl border border-stone-100 bg-white px-4 py-2 text-center shadow-sm">
                    <p className="text-xs text-stone-600">{currentProfileQuestion.optiSpeech}</p>
                  </div>
                </div>
                <div className="rounded-[2rem] border border-stone-100 bg-white p-6 shadow-md">
                  <p className="text-[10px] font-black uppercase tracking-widest text-forest-600">
                    {currentProfileQuestion.eyebrow}
                  </p>
                  <h2 className="mt-2 font-serif text-2xl font-black leading-tight text-stone-900">
                    {currentProfileQuestion.question}
                  </h2>
                  {currentProfileQuestion.multiSelect ? (
                    <>
                      <div className="mt-5 space-y-2">
                        {currentProfileQuestion.options.map((opt) => {
                          const isChosen = selectedOptions.includes(opt.value);
                          return (
                            <motion.button
                              key={opt.value}
                              type="button"
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleOption(opt.value)}
                              className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left text-sm font-semibold transition ${
                                isChosen
                                  ? "border-forest-300 bg-forest-50 text-forest-800"
                                  : "border-stone-200 bg-parchment-100 text-stone-700 hover:border-forest-200 hover:bg-forest-50"
                              }`}
                            >
                              <span>{opt.label}</span>
                              {isChosen && <span className="ml-2 shrink-0 text-forest-600">✦</span>}
                            </motion.button>
                          );
                        })}
                      </div>
                      {currentProfileQuestion.helperText && (
                        <p className="mt-3 text-center text-[11px] italic text-stone-400">
                          {currentProfileQuestion.helperText}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          answerProfileQuestion(
                            currentProfileQuestion.key,
                            selectedOptions as CurrentStruggle[],
                          )
                        }
                        className="mt-4 w-full rounded-full bg-forest-700 py-3 font-black text-white transition hover:bg-forest-800"
                      >
                        {selectedOptions.length === 0 ? "Skip →" : "Continue →"}
                      </button>
                    </>
                  ) : (
                    <div className="mt-5 space-y-2">
                      {currentProfileQuestion.options.map((opt) => (
                        <motion.button
                          key={opt.value}
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            answerProfileQuestion(currentProfileQuestion.key, opt.value)
                          }
                          className="w-full rounded-2xl border border-stone-200 bg-parchment-100 p-4 text-left text-sm font-semibold text-stone-700 transition hover:border-forest-200 hover:bg-forest-50"
                        >
                          {opt.label}
                        </motion.button>
                      ))}
                    </div>
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
                  Óptima is personalized to you. You can update your profile anytime.
                </p>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleComplete}
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
