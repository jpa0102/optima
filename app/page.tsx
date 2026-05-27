"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AreaRing } from "@/components/AreaRing";
import { BottomNav, type NavTab } from "@/components/BottomNav";
import { CategorySheet } from "@/components/CategorySheet";
import { CheckInHabitCard } from "@/components/CheckInHabitCard";
import { Companion } from "@/components/Companion";
import { NotificationSetup } from "@/components/NotificationSetup";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { PillarBar } from "@/components/PillarBar";
import { SabbathScreen } from "@/components/SabbathScreen";
import { SettingsSheet } from "@/components/SettingsSheet";
import { SmartNudge } from "@/components/SmartNudge";
import { getTipForCategory } from "@/data/categoryTips";
import { categoryConfig, categoryEmoji } from "@/lib/categoryConfig";
import { categories, habits, savedDays } from "@/data/habits";
import { getGameStats, loadGameStats } from "@/lib/gamification";
import {
  NOTIF_PERMISSION_KEY,
  canNotify,
  scheduleReminderNotification,
} from "@/lib/notifications";
import { buildScoreSummary } from "@/lib/scoring";
import type {
  Category,
  CompanionMood,
  OnboardingAnswers,
  RatingLabel,
} from "@/types/optima";

const ONBOARDING_COMPLETED_KEY = "optima_onboarding_completed";
const ONBOARDING_ANSWERS_KEY = "optima_onboarding_answers";

const starterHabitIds = [
  "quiet-prayer",
  "gratitude",
  "clear-mind",
  "protected-focus",
  "moved-body",
  "connected",
  "one-priority",
  "closed-loop",
];

const stateLabels: Record<CompanionMood, string> = {
  "Flourishing": "Flourishing",
  "Faithful": "Faithful",
  "Pressing On": "Pressing On",
  "Be Still": "Be Still",
};

const stateEmoji: Record<CompanionMood, string> = {
  "Flourishing": "🔥",
  "Faithful": "⚡",
  "Pressing On": "🌱",
  "Be Still": "💤",
};

const stateColors: Record<CompanionMood, string> = {
  "Flourishing": "text-forest-600 dark:text-emerald-300",
  "Faithful":    "text-indigo-700 dark:text-indigo-300",
  "Pressing On": "text-amber-700 dark:text-amber-300",
  "Be Still":    "text-stone-400 dark:text-slate-400",
};

const stateMessages: Record<CompanionMood, string> = {
  "Flourishing": "Walking in step with the Spirit today. Abide in this.",
  "Faithful":    "Steady and present. God sees your faithfulness.",
  "Pressing On": "He who began a good work in you will complete it. Keep going.",
  "Be Still":    "Be still and know that I am God. Rest in His grace today.",
};

const moodScoreGlow: Record<CompanionMood, string> = {
  "Flourishing": "drop-shadow(0 0 28px rgba(45,106,79,0.55))",
  "Faithful":    "drop-shadow(0 0 28px rgba(55,48,163,0.55))",
  "Pressing On": "drop-shadow(0 0 28px rgba(146,64,14,0.50))",
  "Be Still":    "drop-shadow(0 0 28px rgba(120,113,108,0.35))",
};

const ratingBadge: Record<RatingLabel, string> = {
  Optimal:       "bg-forest-50 border-forest-200 text-forest-700 dark:bg-emerald-500/20 dark:border-emerald-400/40 dark:text-emerald-300",
  "Sub Optimal": "bg-amber-50 border-amber-200 text-amber-700 dark:bg-indigo-500/20 dark:border-indigo-400/40 dark:text-indigo-300",
  "Not Optimal": "bg-terra-100 border-terra-200 text-terra-600 dark:bg-rose-500/20 dark:border-rose-400/40 dark:text-rose-300",
};

const pillarConfig: Record<Category, { colorClass: string; glow: string; hex: string }> = {
  Physical:    { colorClass: "bg-emerald-700", glow: "rgba(45,106,79,0.50)",   hex: "#2d6a4f" },
  Mental:      { colorClass: "bg-slate-800",   glow: "rgba(30,58,95,0.50)",    hex: "#1e3a5f" },
  Spiritual:   { colorClass: "bg-violet-700",  glow: "rgba(91,33,182,0.50)",   hex: "#5b21b6" },
  Stewardship: { colorClass: "bg-amber-800",   glow: "rgba(146,64,14,0.50)",   hex: "#92400e" },
  Relational:  { colorClass: "bg-rose-800",    glow: "rgba(157,23,77,0.50)",   hex: "#9d174d" },
};

const growthMessages: Record<Category, string> = {
  Physical:    "Your body is your foundation — even one small move today counts.",
  Mental:      "A quiet moment to reflect will pay dividends all week.",
  Spiritual:   "Reconnecting with purpose shifts everything downstream.",
  Relational:  "One genuine exchange can change the texture of your whole day.",
  Stewardship: "One focused hour of faithful work beats three distracted ones.",
};

const pillarStrengthLabel = (rate: number) => {
  if (rate >= 80) return { text: "Strong",       cls: "text-forest-600 dark:text-emerald-400" };
  if (rate >= 50) return { text: "Building",     cls: "text-blue-700 dark:text-blue-400" };
  if (rate >= 20) return { text: "Needs focus",  cls: "text-amber-700 dark:text-amber-400" };
  return              { text: "Opportunity",  cls: "text-terra-500 dark:text-rose-400" };
};

const pillarHeaderBg: Record<Category, string> = {
  Spiritual:   "bg-violet-50 border-violet-100",
  Mental:      "bg-blue-50 border-blue-100",
  Physical:    "bg-emerald-50 border-emerald-100",
  Relational:  "bg-pink-50 border-pink-100",
  Stewardship: "bg-amber-50 border-amber-100",
};

const pillarScripture: Record<Category, string> = {
  Spiritual:   "Walk with God. — Gen 5:24",
  Mental:      "Renew your mind. — Rom 12:2",
  Physical:    "Honor God in your body. — 1 Cor 6:19",
  Relational:  "Love one another. — John 13:34",
  Stewardship: "Work as unto the Lord. — Col 3:23",
};

const pillarCelebrationVerse: Record<Category, string> = {
  Spiritual:   "Draw near to God and He will draw near to you. — James 4:8",
  Mental:      "You have the mind of Christ. — 1 Corinthians 2:16",
  Physical:    "Your body is a temple of the Holy Spirit. — 1 Corinthians 6:19",
  Relational:  "This is my commandment: love one another. — John 15:12",
  Stewardship: "Well done, good and faithful servant. — Matthew 25:21",
};

export default function Home() {
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [selectedHabitIds, setSelectedHabitIds] =
    useState<string[]>(starterHabitIds);
  const [displayScore, setDisplayScore] = useState(0);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [notifAsked, setNotifAsked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showTapHint, setShowTapHint] = useState(true);
  const [isSabbath, setIsSabbath] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activePillar, setActivePillar] = useState<Category>("Spiritual");

  useEffect(() => {
    const completed =
      window.localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";
    setHasCompletedOnboarding(completed);
    setHasCheckedOnboarding(true);
    const asked =
      window.localStorage.getItem(NOTIF_PERMISSION_KEY) === "asked";
    setNotifAsked(asked);

    const dayOfWeek = new Date().getDay();
    const sabbathDay = parseInt(
      window.localStorage.getItem("optima_sabbath_day") ?? "0",
      10,
    );

    setIsSabbath(dayOfWeek === sabbathDay);
  }, []);

  const summary = useMemo(
    () => buildScoreSummary(selectedHabitIds),
    [selectedHabitIds],
  );

  const rawStats = useMemo(() => {
    if (typeof window === "undefined")
      return { totalXP: 0, streak: 0, longestStreak: 0, lastCheckinDate: "" };
    return loadGameStats();
  }, []);

  const gameStats = useMemo(
    () =>
      getGameStats(
        rawStats.totalXP,
        rawStats.streak,
        rawStats.longestStreak,
        rawStats.lastCheckinDate,
      ),
    [rawStats],
  );

  useEffect(() => {
    if (activeTab !== "home") return;
    setDisplayScore(0);
    const target = summary.score;
    const steps = 32;
    const stepMs = 1100 / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const t = step / steps;
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(eased * target));
      if (step >= steps) {
        setDisplayScore(target);
        clearInterval(timer);
      }
    }, stepMs);
    return () => clearInterval(timer);
  }, [summary.score, activeTab]);

  useEffect(() => {
    const t = setTimeout(() => setShowTapHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const weakest = [...summary.categoryScores].sort(
      (a, b) => a.completionRate - b.completionRate,
    )[0];
    if (!weakest || weakest.completionRate >= 50) return;
    if (!canNotify()) return;
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86_400_000,
    );
    const tip = getTipForCategory(weakest.category, dayOfYear);
    if (tip) scheduleReminderNotification(weakest.category, tip, "19:00", rawStats.streak);
  }, [summary.categoryScores]);

  const toggleHabit = (habitId: string) => {
    setSelectedHabitIds((current) =>
      current.includes(habitId)
        ? current.filter((id) => id !== habitId)
        : [...current, habitId],
    );
  };

  const completeOnboarding = (answers: OnboardingAnswers) => {
    window.localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    window.localStorage.setItem(
      ONBOARDING_ANSWERS_KEY,
      JSON.stringify(answers),
    );
    setHasCompletedOnboarding(true);
    setActiveTab("home");
  };

  const resetOnboarding = () => {
    window.localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    window.localStorage.removeItem(ONBOARDING_ANSWERS_KEY);
    setHasCompletedOnboarding(false);
    setActiveTab("home");
  };

  if (!hasCheckedOnboarding) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-parchment-100 dark:bg-[#07070a]">
        <div className="text-center">
          <p className="font-serif text-xs font-semibold uppercase tracking-[0.34em] text-forest-600 dark:text-emerald-200/60">
            Óptima
          </p>
          <p className="mt-3 text-sm text-stone-400 dark:text-white/45">
            Preparing your check-in...
          </p>
        </div>
      </main>
    );
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  const mood = summary.rating.companionMood;
  const positiveHabits = habits.filter((h) => h.kind === "positive");
  const xpToday = Math.max(5, Math.round(summary.score * 0.5));

  const activePillarIdx = categories.indexOf(activePillar);
  const prevPillar = activePillarIdx > 0 ? categories[activePillarIdx - 1] : null;
  const nextPillar = activePillarIdx < categories.length - 1 ? categories[activePillarIdx + 1] : null;
  const activePillarCfg = categoryConfig[activePillar];
  const activePillarCatScore = summary.categoryScores.find((cs) => cs.category === activePillar)!;
  const activePillarPositive = habits.filter((h) => h.category === activePillar && h.kind === "positive");
  const activePillarDrain = habits.filter((h) => h.category === activePillar && h.kind === "drain");
  const activePillarDoneCount = activePillarPositive.filter((h) => selectedHabitIds.includes(h.id)).length;

  return (
    <main className="min-h-screen bg-parchment-100 text-stone-900 dark:bg-[#07070a] dark:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-4 pt-5">
        <header className="mb-3 flex items-center justify-between">
          <p className="font-serif text-[0.6rem] font-bold uppercase tracking-[0.4em] text-stone-400 dark:text-white/28">
            Óptima
          </p>
          {activeTab === "home" ? (
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-400 transition hover:text-stone-600 dark:bg-white/[0.06] dark:text-white/30 dark:hover:text-white/60"
              aria-label="Settings"
            >
              ⚙
            </button>
          ) : (
            <button
              type="button"
              onClick={resetOnboarding}
              className="rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-400 transition hover:text-stone-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/45 dark:hover:text-white"
            >
              Reset onboarding
            </button>
          )}
        </header>

        <div className="flex-1 space-y-5">
          {/* ── HOME TAB ─────────────────────────────────────────────── */}
          {activeTab === "home" ? (
            <div className="flex flex-col items-center gap-5 pb-2">
              {isSabbath ? (
                <SabbathScreen />
              ) : (
                <>
              {/* Notification permission prompt */}
              {!notifAsked && (
                <NotificationSetup
                  onComplete={() => setNotifAsked(true)}
                />
              )}

              {/* Opti hero */}
              <Companion mood={mood} size="lg" />

              {/* State label */}
              <motion.p
                key={mood}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.1, 1], opacity: [0, 1, 1] }}
                transition={{ duration: 0.45, times: [0, 0.65, 1], ease: "easeOut" }}
                className={`font-serif text-4xl font-black ${stateColors[mood]}`}
              >
                {stateLabels[mood]}{" "}
                <span className="text-3xl">{stateEmoji[mood]}</span>
              </motion.p>

              {/* Streak + Level row */}
              <div className="flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
                <span className="text-sm font-bold text-terra-500 dark:text-amber-300">
                  {gameStats.currentStreak > 0
                    ? `✦ ${gameStats.currentStreak} days walking`
                    : "Begin your walk today"}
                </span>
                <span
                  className="rounded-full border px-3 py-0.5 text-xs font-bold"
                  style={{
                    color: gameStats.level.color,
                    borderColor: gameStats.level.color + "55",
                    backgroundColor: gameStats.level.color + "18",
                  }}
                >
                  Lv.{gameStats.level.tier} · {gameStats.level.title}
                </span>
              </div>

              {/* Message pill */}
              <motion.div
                key={`msg-${mood}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.18 }}
                className="w-full rounded-2xl border border-stone-200 bg-white/80 px-5 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.07] dark:shadow-none"
              >
                <p className="text-center font-serif text-base italic leading-6 text-stone-600 dark:text-white/70">
                  {stateMessages[mood]}
                </p>
              </motion.div>

              {/* Score */}
              <div className="text-center">
                <div
                  className="flex items-center justify-center"
                  style={{ filter: moodScoreGlow[mood] }}
                >
                  <span className="font-serif text-8xl font-black tracking-tight text-stone-900 tabular-nums dark:text-white">
                    {displayScore}
                  </span>
                  <span className="ml-2 self-center text-3xl font-semibold text-stone-400 dark:text-white/35">
                    / 100
                  </span>
                </div>
                <div className="mt-3 flex flex-col items-center">
                  <span
                    className={`rounded-full border px-4 py-1 text-xs font-bold uppercase tracking-widest ${ratingBadge[summary.rating.label]}`}
                  >
                    {summary.rating.label}
                  </span>
                  <p className="mt-2 max-w-[240px] text-center text-[11px] leading-5 text-stone-400 dark:text-white/30">
                    This score reflects stewardship —
                    not your worth before God.
                  </p>
                </div>
              </div>

              {/* Area mastery rings */}
              <div className="w-full">
                <p className="mb-4 text-[0.58rem] font-bold uppercase tracking-[0.32em] text-stone-400 dark:text-white/28">
                  Life Areas
                </p>
                <div className="flex flex-wrap justify-center gap-5">
                  {summary.categoryScores.map((cs, i) => (
                    <AreaRing
                      key={cs.category}
                      name={cs.category}
                      percent={cs.completionRate}
                      color={categoryConfig[cs.category].accent}
                      delay={i * 0.08}
                      isSelected={selectedCategory === cs.category}
                      onClick={() => setSelectedCategory(cs.category)}
                    />
                  ))}
                </div>
                <AnimatePresence>
                  {showTapHint && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mt-2 text-center text-[10px] text-stone-400 dark:text-white/25"
                    >
                      tap any area to explore
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Growth opportunity callout */}
              {summary.growthArea && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"
                >
                  <p className="mb-1 text-[0.6rem] font-bold uppercase tracking-widest text-terra-500 dark:text-white/30">
                    📍 Growth opportunity
                  </p>
                  <p className="font-serif text-sm font-bold text-stone-800 dark:text-white">
                    {summary.growthArea} is your focus area today
                  </p>
                  <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-white/45">
                    {growthMessages[summary.growthArea]}
                  </p>
                </motion.div>
              )}

              {/* Smart nudge */}
              {!nudgeDismissed && (
                <SmartNudge
                  categoryScores={summary.categoryScores}
                  onDismiss={() => setNudgeDismissed(true)}
                  onCheckIn={() => setActiveTab("check-in")}
                />
              )}

              {/* CTA */}
              <motion.button
                type="button"
                onClick={() => setActiveTab("check-in")}
                animate={{
                  boxShadow: [
                    "0 4px 20px rgba(45,106,79,0.20)",
                    "0 4px 40px rgba(45,106,79,0.40)",
                    "0 4px 20px rgba(45,106,79,0.20)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-full rounded-full bg-forest-700 px-5 py-5 text-base font-black text-white dark:bg-gradient-to-r dark:from-emerald-400 dark:to-cyan-400 dark:text-zinc-900"
              >
                Steward Today →
              </motion.button>
                </>
              )}
            </div>
          ) : null}

          {/* ── CHECK-IN TAB ──────────────────────────────────────────── */}
          {activeTab === "check-in" ? (
            <div className="pb-32">
              {/* Pillar navigation tabs */}
              <div className="mb-5 flex border-b border-stone-100 dark:border-white/10">
                {categories.map((cat) => {
                  const catScore = summary.categoryScores.find((cs) => cs.category === cat)!;
                  const isActive = activePillar === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActivePillar(cat)}
                      className="relative flex flex-1 flex-col items-center gap-0.5 pb-2 pt-1"
                    >
                      <span className="text-base">{categoryEmoji[cat]}</span>
                      <span
                        className={`text-[11px] transition-colors ${
                          isActive
                            ? "font-black text-forest-700 dark:text-emerald-300"
                            : "font-bold text-stone-400 dark:text-white/30"
                        }`}
                      >
                        {cat}
                      </span>
                      {catScore.presenceAchieved && (
                        <span className="text-[8px] leading-none text-forest-600 dark:text-emerald-400">
                          ✦
                        </span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="pillar-tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-forest-600 dark:bg-emerald-400"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Pillar content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePillar}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  {/* Pillar header card */}
                  <div className={`mb-4 rounded-[2rem] border p-5 ${pillarHeaderBg[activePillar]}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{categoryEmoji[activePillar]}</span>
                      <div className="flex-1">
                        <h2 className="font-serif text-xl font-black text-stone-800">
                          {activePillar}
                        </h2>
                        <p className="mt-0.5 text-xs italic text-stone-500">
                          {pillarScripture[activePillar]}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-100/80">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: activePillarCfg.accent }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${activePillarCatScore.completionRate}%` }}
                        transition={{ type: "spring", stiffness: 80, damping: 18 }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-stone-400">
                      {activePillarDoneCount} of {activePillarPositive.length} logged
                    </p>
                  </div>

                  {/* Practices */}
                  <p className="mb-3 mt-5 text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-white/30">
                    Practices
                  </p>
                  <div className="space-y-2">
                    {activePillarPositive.map((habit, i) => (
                      <CheckInHabitCard
                        key={habit.id}
                        habit={habit}
                        isSelected={selectedHabitIds.includes(habit.id)}
                        onToggle={toggleHabit}
                        categoryAccent={activePillarCfg}
                        index={i}
                      />
                    ))}
                  </div>

                  {/* Obstacles */}
                  {activePillarDrain.length > 0 && (
                    <div>
                      <div className="mb-1 mt-6 flex items-center gap-2">
                        <span className="text-sm text-terra-500 dark:text-rose-400">⚠</span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-terra-500 dark:text-rose-400">
                          Seeking Freedom From
                        </p>
                      </div>
                      <p className="mb-3 text-xs italic text-stone-400 dark:text-white/30">
                        Check anything that had a hold on you today. Honesty here is an act of courage.
                      </p>
                      <div className="space-y-2">
                        {activePillarDrain.map((habit, i) => (
                          <CheckInHabitCard
                            key={habit.id}
                            habit={habit}
                            isSelected={selectedHabitIds.includes(habit.id)}
                            onToggle={toggleHabit}
                            categoryAccent={activePillarCfg}
                            index={i}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completion card */}
                  <AnimatePresence>
                    {activePillarCatScore.presenceAchieved && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ delay: 0.15, duration: 0.25 }}
                        className="mt-6 rounded-[2rem] p-4 text-center"
                        style={{
                          backgroundColor: activePillarCfg.bg,
                          border: `1px solid ${activePillarCfg.border}`,
                        }}
                      >
                        <p className="font-serif font-semibold text-stone-700 dark:text-white">
                          ✦ You showed up in {activePillar} today.
                        </p>
                        <p className="mt-2 text-xs italic text-stone-500 dark:text-white/40">
                          {pillarCelebrationVerse[activePillar]}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pillar navigation */}
                  <div className="mb-4 mt-6 flex justify-between">
                    {prevPillar ? (
                      <button
                        type="button"
                        onClick={() => setActivePillar(prevPillar)}
                        className="text-sm font-semibold text-stone-400 transition hover:text-stone-600 dark:text-white/30 dark:hover:text-white/60"
                      >
                        ← {prevPillar}
                      </button>
                    ) : (
                      <div />
                    )}
                    {nextPillar ? (
                      <button
                        type="button"
                        onClick={() => setActivePillar(nextPillar)}
                        className="rounded-full bg-forest-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-800 dark:bg-emerald-500 dark:text-zinc-900 dark:hover:bg-emerald-400"
                      >
                        {nextPillar} →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveTab("home")}
                        className="rounded-full bg-forest-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-800 dark:bg-emerald-500 dark:text-zinc-900 dark:hover:bg-emerald-400"
                      >
                        Done for today ✦
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          ) : null}

          {/* ── JOURNEY TAB ───────────────────────────────────────────── */}
          {activeTab === "journey" ? (
            <div className="space-y-5">
              {/* Top stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: "✦", value: String(gameStats.currentStreak), label: "Days Walking", sub: `Best: ${gameStats.longestStreak}d`, iconCls: "text-terra-500 dark:text-amber-300" },
                  { icon: "⚡", value: String(gameStats.totalXP), label: "Total XP", sub: undefined as string | undefined, iconCls: "" },
                  { icon: "🏆", value: `Lv.${gameStats.level.tier}`, label: gameStats.level.title, sub: undefined as string | undefined, iconCls: "" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="flex flex-col items-center gap-1 rounded-2xl border border-stone-100 bg-white p-3 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:shadow-none"
                  >
                    <span className={`text-lg ${card.iconCls}`}>{card.icon}</span>
                    <span className="font-serif text-xl font-bold text-stone-900 dark:text-white">
                      {card.value}
                    </span>
                    <span className="text-[0.6rem] text-stone-400 dark:text-white/40">{card.label}</span>
                    {card.sub && (
                      <span className="text-[0.55rem] text-stone-300 dark:text-white/25">{card.sub}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Level progress bar */}
              <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 dark:text-white">
                    Level {gameStats.level.tier} · {gameStats.level.title}
                  </span>
                  <span className="text-xs text-stone-400 dark:text-white/40">
                    {gameStats.xpToNextLevel > 0
                      ? `${gameStats.xpToNextLevel} XP to next level`
                      : "Max level"}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: gameStats.level.color,
                      boxShadow: `0 0 12px ${gameStats.level.color}88`,
                    }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${gameStats.xpProgressPercent}%` }}
                    transition={{ type: "spring", stiffness: 55, damping: 13, delay: 0.2 }}
                  />
                </div>
              </div>

              {/* Life area snapshot */}
              <div>
                <p className="mb-3 text-[0.58rem] font-bold uppercase tracking-[0.32em] text-stone-400 dark:text-white/28">
                  Life Area Snapshot
                </p>
                <div className="space-y-3">
                  {summary.categoryScores.map((cs, i) => {
                    const strength = pillarStrengthLabel(cs.completionRate);
                    return (
                      <div key={cs.category} className="flex items-center gap-3">
                        <PillarBar
                          name={cs.category}
                          value={cs.completionRate / 100}
                          colorClass={pillarConfig[cs.category].colorClass}
                          glow={pillarConfig[cs.category].glow}
                          delay={i * 0.08}
                        />
                        <span
                          className={`w-24 shrink-0 text-right text-[0.6rem] font-bold ${strength.cls}`}
                        >
                          {strength.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent sessions */}
              <div>
                <p className="mb-3 text-[0.58rem] font-bold uppercase tracking-[0.32em] text-stone-400 dark:text-white/28">
                  Recent sessions
                </p>
                <div className="space-y-3">
                  {savedDays.map((day) => {
                    const daySummary = buildScoreSummary(day.selectedHabitIds);
                    return (
                      <article
                        key={day.id}
                        className="rounded-3xl border border-stone-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:shadow-none"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-stone-800 dark:text-white">
                              {day.dateLabel}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-white/48">
                              {day.reflection}
                            </p>
                            {/* Mini category bars */}
                            <div className="mt-2 flex gap-1.5">
                              {daySummary.categoryScores.map((cs) => (
                                <div
                                  key={cs.category}
                                  className="flex flex-col items-center gap-0.5"
                                  title={`${cs.category}: ${cs.completionRate}%`}
                                >
                                  <div className="h-6 w-2 overflow-hidden rounded-full bg-stone-100 dark:bg-white/10">
                                    <div
                                      className={`w-full rounded-full ${pillarConfig[cs.category].colorClass}`}
                                      style={{
                                        height: `${cs.completionRate}%`,
                                        marginTop: `${100 - cs.completionRate}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                              {day.score} / 100
                            </p>
                            <p className="text-xs text-stone-400 dark:text-white/45">{day.rating}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <AnimatePresence>
        {selectedCategory && (
          <CategorySheet
            category={selectedCategory}
            categoryScore={summary.categoryScores.find((c) => c.category === selectedCategory)!}
            habits={habits}
            selectedHabitIds={selectedHabitIds}
            onClose={() => setSelectedCategory(null)}
            onGoToCheckIn={() => {
              setSelectedCategory(null);
              setActiveTab("check-in");
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSettings && (
          <SettingsSheet onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
      {/* Fade gradient above bottom nav */}
      <div className="pointer-events-none fixed bottom-16 left-0 right-0 z-10 h-12 bg-gradient-to-t from-parchment-100 to-transparent dark:from-[#07070a]" />
    </main>
  );
}
