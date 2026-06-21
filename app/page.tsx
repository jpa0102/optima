"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BottomNav, type NavTab } from "@/components/BottomNav";
import { CategorySheet } from "@/components/CategorySheet";
import { Companion } from "@/components/Companion";
import { DailyIntentionCard } from "@/components/DailyIntentionCard";
import { IntentionPicker } from "@/components/IntentionPicker";
import { NotificationSetup } from "@/components/NotificationSetup";
import { DailyQuestCard } from "@/components/DailyQuestCard";
import { LevelUpCelebration } from "@/components/LevelUpCelebration";
import { MyPracticesScreen } from "@/components/MyPracticesScreen";
import { QuestAcceptanceModal } from "@/components/QuestAcceptanceModal";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { PillarBar } from "@/components/PillarBar";
import { FaithfulDayCelebration } from "@/components/FaithfulDayCelebration";
import { getHabitsForToday } from "@/lib/habitFiltering";
import { SabbathScreen } from "@/components/SabbathScreen";
import { SettingsSheet } from "@/components/SettingsSheet";
import { SmartNudge } from "@/components/SmartNudge";
import { getTipForCategory } from "@/data/categoryTips";
import { categoryEmoji } from "@/lib/categoryConfig";
import { categories, habits } from "@/data/habits";
import {
  addXP,
  awardCheckInXP,
  awardXP,
  getGameStats,
  loadGameStats,
  ROMAN_NUMERALS,
  saveGameStats,
  updateStreak,
} from "@/lib/gamification";
import {
  archiveDay,
  clearTodayHabits,
  getDayLabel,
  getSavedDate,
  getTodayString,
  hasPreviousDayToArchive,
  loadHistory,
  loadRawSavedHabits,
  loadTodayHabits,
  saveTodayHabits,
} from "@/lib/dailyStorage";
import {
  addIntention,
  createEmptyIntentions,
  DEFAULT_REMINDER_TIMES,
  loadIntentions,
  removeIntention,
  saveIntentions,
  updateCustomTimeForAll,
} from "@/lib/intentions";
import { getIntentionMessage } from "@/lib/intentionMessages";
import { scheduleIntentionReminders } from "@/lib/reminderScheduler";
import { quests } from "@/data/quests";
import {
  completeQuest,
  getQuestById,
  getTodayQuest,
  loadDailyQuest,
  loadQuestHistory,
  saveDailyQuest,
  skipQuest,
  startQuest,
} from "@/lib/questSelector";
import { STRUGGLE_LABELS } from "@/lib/userProfile";
import {
  NOTIF_PERMISSION_KEY,
  canNotify,
  clearScheduledDailyReminders,
  requestNotificationPermission,
  scheduleDailyReminders,
  scheduleQuestReminders,
  scheduleReminderNotification,
} from "@/lib/notifications";
import { buildScoreSummary } from "@/lib/scoring";
import {
  getAdaptiveCompanionMessage,
  getDefaultProfile,
  getPersonalizedHabits,
  loadUserProfile,
  saveUserProfile,
} from "@/lib/userProfile";
import type {
  Category,
  CompanionMood,
  DailyIntentions,
  DailyQuest,
  DailyRecord,
  Habit,
  Level,
  OnboardingAnswers,
  PinnedIntention,
  Quest,
  RatingLabel,
  ScoreSummary,
  UserProfile,
} from "@/types/optima";

const ONBOARDING_COMPLETED_KEY = "optima_onboarding_completed";
const ONBOARDING_ANSWERS_KEY = "optima_onboarding_answers";

const stateLabels: Record<CompanionMood, string> = {
  "Flourishing": "Flourishing",
  "Faithful": "Faithful",
  "Pressing On": "Pressing On",
  "Be Still": "Be Still",
};

const moodIndicator: Record<CompanionMood, string> = {
  "Flourishing": "✦",
  "Faithful":    "·",
  "Pressing On": "↻",
  "Be Still":    "𝓏",
};

const pillarCircleClass: Record<Category, string> = {
  Spiritual:   "bg-violet-50 text-violet-600",
  Mental:      "bg-blue-50 text-blue-600",
  Physical:    "bg-emerald-50 text-emerald-600",
  Relational:  "bg-pink-50 text-pink-600",
  Stewardship: "bg-amber-50 text-amber-600",
};


const stateColors: Record<CompanionMood, string> = {
  "Flourishing": "text-forest-600 dark:text-emerald-300",
  "Faithful":    "text-indigo-700 dark:text-indigo-300",
  "Pressing On": "text-amber-700 dark:text-amber-300",
  "Be Still":    "text-stone-400 dark:text-slate-400",
};


const scoreColor: Record<CompanionMood, string> = {
  "Flourishing": "text-forest-600",
  "Faithful":    "text-indigo-600",
  "Pressing On": "text-amber-600",
  "Be Still":    "text-stone-400",
};

const ratingBarBadge: Record<RatingLabel, string> = {
  Optimal:       "bg-forest-600 text-white",
  "Sub Optimal": "bg-indigo-500 text-white",
  "Not Optimal": "bg-terra-500 text-white",
};

const pillarBarConfig: Record<Category, { barColor: string; glow: string; nameColor: string }> = {
  Spiritual:   { barColor: "bg-violet-400",  glow: "rgba(167,139,250,0.5)", nameColor: "text-violet-600" },
  Mental:      { barColor: "bg-blue-400",    glow: "rgba(96,165,250,0.5)",  nameColor: "text-blue-600" },
  Physical:    { barColor: "bg-emerald-400", glow: "rgba(52,211,153,0.5)",  nameColor: "text-forest-600" },
  Relational:  { barColor: "bg-pink-400",    glow: "rgba(244,114,182,0.5)", nameColor: "text-pink-600" },
  Stewardship: { barColor: "bg-amber-400",   glow: "rgba(251,146,60,0.5)",  nameColor: "text-amber-600" },
};

const pillarConfig: Record<Category, { colorClass: string; glow: string; hex: string }> = {
  Physical:    { colorClass: "bg-emerald-700", glow: "rgba(45,106,79,0.50)",   hex: "#2d6a4f" },
  Mental:      { colorClass: "bg-slate-800",   glow: "rgba(30,58,95,0.50)",    hex: "#1e3a5f" },
  Spiritual:   { colorClass: "bg-violet-700",  glow: "rgba(91,33,182,0.50)",   hex: "#5b21b6" },
  Stewardship: { colorClass: "bg-amber-800",   glow: "rgba(146,64,14,0.50)",   hex: "#92400e" },
  Relational:  { colorClass: "bg-rose-800",    glow: "rgba(157,23,77,0.50)",   hex: "#9d174d" },
};

const pillarSubtleBg: Record<Category, string> = {
  Spiritual:   "bg-violet-50",
  Mental:      "bg-blue-50",
  Physical:    "bg-emerald-50",
  Relational:  "bg-pink-50",
  Stewardship: "bg-amber-50",
};

const pillarCelebrationVerse: Record<Category, { quote: string; ref: string }> = {
  Spiritual:   { quote: "Draw near to God and He will draw near to you.", ref: "James 4:8" },
  Mental:      { quote: "You have the mind of Christ.", ref: "1 Corinthians 2:16" },
  Physical:    { quote: "Your body is a temple of the Holy Spirit.", ref: "1 Corinthians 6:19" },
  Relational:  { quote: "This is my commandment: love one another.", ref: "John 15:12" },
  Stewardship: { quote: "Well done, good and faithful servant.", ref: "Matthew 25:21" },
};


const pillarStrengthLabel = (rate: number) => {
  if (rate >= 80) return { text: "Strong",       cls: "text-forest-600 dark:text-emerald-400" };
  if (rate >= 50) return { text: "Building",     cls: "text-blue-700 dark:text-blue-400" };
  if (rate >= 20) return { text: "Needs focus",  cls: "text-amber-700 dark:text-amber-400" };
  return              { text: "Opportunity",  cls: "text-terra-500 dark:text-rose-400" };
};

type RawStats = { totalXP: number; streak: number; longestStreak: number; lastCheckinDate: string };
const defaultRawStats: RawStats = { totalXP: 0, streak: 0, longestStreak: 0, lastCheckinDate: "" };

// ── Opti reaction data ──────────────────────────────────────────────────────

const positiveYesReactions: Record<string, string[]> = {
  "morning-prayer": ["That time with God anchors everything.", "The best way to start a day."],
  "daily-scripture-reading": ["His Word is living and active.", "You fed your spirit today."],
  "sleep-7-9": ["Rest is an act of trust in God.", "Your body thanks you."],
  "moved-body": ["Honoring the temple well.", "God is glorified in how you care for yourself."],
  "meaningful-conversation": ["That connection matters more than you know.", "Love in action."],
  "focused-work-block": ["Working as unto the Lord.", "That focus is a gift to your calling."],
};

const genericPositiveYes = [
  "Keep going. This is faithfulness.",
  "God sees this.",
  "Well done.",
  "This is what a faithful day looks like.",
  "Small obediences compound.",
];

const genericPositiveNo = [
  "Tomorrow is a fresh start.",
  "Grace covers this.",
  "His mercies are new every morning.",
  "That's honest. That's enough.",
  "You showed up to reflect. That matters.",
];

const drainYes = [
  "Thank you for being honest. That's courage.",
  "Naming it is the first step to freedom.",
  "Bring this to God. He already knows.",
  "Honesty here is an act of repentance.",
];

const drainNo = [
  "Walking in freedom today. ✦",
  "That's the Spirit at work in you.",
  "Well done. Stay the course.",
  "Freedom is built one day at a time.",
];

function getOptiReaction(habit: Habit, answered: boolean): string {
  if (habit.kind === "drain") {
    const pool = answered ? drainYes : drainNo;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  if (answered) {
    const specific = positiveYesReactions[habit.id];
    if (specific) return specific[Math.floor(Math.random() * specific.length)];
    return genericPositiveYes[Math.floor(Math.random() * genericPositiveYes.length)];
  }
  return genericPositiveNo[Math.floor(Math.random() * genericPositiveNo.length)];
}

// ── Quest reason ────────────────────────────────────────────────────────────

function getQuestReason(quest: Quest, profile: UserProfile, summary: ScoreSummary): string {
  const matchingStruggles = quest.forStruggles?.filter((s) =>
    profile.currentStruggles.includes(s),
  );
  if (matchingStruggles && matchingStruggles.length > 0) {
    const label = STRUGGLE_LABELS[matchingStruggles[0]].toLowerCase();
    return `Because you're working through ${label}.`;
  }
  const weakest = [...summary.categoryScores].sort((a, b) => a.completionRate - b.completionRate)[0];
  if (weakest && quest.category === weakest.category) {
    return `Because ${weakest.category} has been your weakest pillar recently.`;
  }
  if (quest.forLifeSeasons?.includes(profile.lifeSeason)) {
    return "Because this fits the season you're in right now.";
  }
  if (quest.forFaithStages?.includes(profile.faithStage)) {
    return "Because this fits where you are in your walk.";
  }
  return "Because today is a good day for this.";
}

// ── Component ───────────────────────────────────────────────────────────────

export default function Home() {
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [notifAsked, setNotifAsked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSabbath, setIsSabbath] = useState(false);
  const [sabbathDay, setSabbathDay] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [rawStats, setRawStats] = useState<RawStats>(defaultRawStats);
  const [history, setHistory] = useState<DailyRecord[]>([]);
  const [intentions, setIntentions] = useState<DailyIntentions>(createEmptyIntentions);
  const [showIntentionPicker, setShowIntentionPicker] = useState(false);
  const [showFaithfulCelebration, setShowFaithfulCelebration] = useState(false);
  const [showMyPractices, setShowMyPractices] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(getDefaultProfile);
  const [dailyQuest, setDailyQuest] = useState<DailyQuest | null>(null);
  const [questBonusCategory, setQuestBonusCategory] = useState<Category | undefined>(undefined);
  const [showQuestAcceptance, setShowQuestAcceptance] = useState(false);
  const [questSwapsRemaining, setQuestSwapsRemaining] = useState(1);
  const [levelUpData, setLevelUpData] = useState<{ old: Level; new: Level } | null>(null);
  const isPremium = false;

  // Check-in sub-view state
  const [checkInView, setCheckInView] = useState<"pillars" | "session" | "complete">("pillars");
  const [activePillar, setActivePillar] = useState<Category | null>(null);
  const [sessionHabits, setSessionHabits] = useState<Habit[]>([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, boolean | null>>({});
  const [optiReaction, setOptiReaction] = useState("");
  const [showReaction, setShowReaction] = useState(false);
  const reactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const completed = window.localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";
    setHasCompletedOnboarding(completed);
    setHasCheckedOnboarding(true);

    const savedProfile = loadUserProfile();
    setUserProfile(savedProfile);
    const profileCompleted = window.localStorage.getItem("optima_profile_completed") === "true";
    if (completed && !profileCompleted) setShowProfilePrompt(true);

    // Load or select today's quest (needs category scores — use empty array on first load)
    const existingQuest = loadDailyQuest();
    if (existingQuest) {
      setDailyQuest(existingQuest);
      if (existingQuest.status === "completed") {
        const qd = getQuestById(existingQuest.questId);
        if (qd) setQuestBonusCategory(qd.category);
      }
    }

    const asked = window.localStorage.getItem(NOTIF_PERMISSION_KEY) === "asked";
    setNotifAsked(asked);

    const storedSabbathDay = parseInt(window.localStorage.getItem("optima_sabbath_day") ?? "0", 10);
    setSabbathDay(storedSabbathDay);
    setIsSabbath(new Date().getDay() === storedSabbathDay);

    if (hasPreviousDayToArchive()) {
      const savedDate = getSavedDate()!;
      const prevHabits = loadRawSavedHabits() ?? [];
      const prevSummary = buildScoreSummary(prevHabits);
      const record: DailyRecord = {
        date: savedDate,
        dateLabel: getDayLabel(savedDate),
        score: prevSummary.score,
        companionMood: prevSummary.rating.companionMood,
        ratingLabel: prevSummary.rating.label,
        selectedHabitIds: prevHabits,
        categoryScores: prevSummary.categoryScores,
        pillarsPresent: prevSummary.pillarsPresent,
        isFaithfulDay: prevSummary.isFaithfulDay,
        topPillar: prevSummary.strongestArea,
        weakestPillar: prevSummary.growthArea,
      };
      archiveDay(record);
      const statsNow = loadGameStats();
      saveGameStats({ ...statsNow, totalXP: addXP(statsNow.totalXP, prevSummary.score) });
      updateStreak(savedDate, sabbathDay);
      clearTodayHabits();
    }

    const todayHabits = loadTodayHabits();
    if (todayHabits !== null) setSelectedHabitIds(todayHabits);

    setHistory(loadHistory());
    setRawStats(loadGameStats());

    const savedIntentions = loadIntentions();
    setIntentions(savedIntentions);
    if (savedIntentions.intentions.length > 0) {
      scheduleIntentionReminders(savedIntentions.intentions);
    }
  }, []);

  useEffect(() => {
    if (!hasCheckedOnboarding || !hasCompletedOnboarding) return;
    saveTodayHabits(selectedHabitIds);
  }, [selectedHabitIds, hasCheckedOnboarding, hasCompletedOnboarding]);

  useEffect(() => {
    if (activeTab !== "check-in") setCheckInView("pillars");
  }, [activeTab]);

  useEffect(() => {
    return () => { if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current); };
  }, []);

  const todayHabits = useMemo(
    () => getHabitsForToday(getPersonalizedHabits(habits, userProfile), new Date(), sabbathDay),
    [sabbathDay, userProfile],
  );

  const summary = useMemo(
    () => buildScoreSummary(selectedHabitIds, todayHabits, questBonusCategory),
    [selectedHabitIds, todayHabits, questBonusCategory],
  );

  useEffect(() => {
    if (!hasCompletedOnboarding) return;
    const quest = getTodayQuest(userProfile, summary.categoryScores);
    setDailyQuest(quest);
    if (quest.status === "completed") {
      const qd = getQuestById(quest.questId);
      if (qd) setQuestBonusCategory(qd.category);
    }
    const questDetail = getQuestById(quest.questId);
    if (questDetail && quest.status !== "completed") {
      scheduleQuestReminders(questDetail, quest);
    }

    // Show acceptance modal on first open of the day
    if (quest.status === "available") {
      const today = getTodayString();
      const acceptanceKey = `optima_quest_acceptance_shown_${today}`;
      if (localStorage.getItem(acceptanceKey) !== "true") {
        setShowQuestAcceptance(true);
      }
    }
  // Only re-select when onboarding completes or profile changes — not on every score update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCompletedOnboarding, userProfile]);

  useEffect(() => {
    if (!summary.isFaithfulDay) return;
    if (!hasCompletedOnboarding) return;
    const today = getTodayString();
    const key = `optima_faithful_celebrated_${today}`;
    if (localStorage.getItem(key) !== "true") {
      setShowFaithfulCelebration(true);
      localStorage.setItem(key, "true");
    }
  }, [summary.isFaithfulDay, hasCompletedOnboarding]);

  // Award XP when a pillar check-in session completes (deduplication prevents double-awarding)
  useEffect(() => {
    if (checkInView !== "complete" || !hasCompletedOnboarding) return;
    const xpResult = awardCheckInXP(summary);
    setRawStats(loadGameStats());
    if (xpResult.leveledUp) {
      setLevelUpData({ old: xpResult.oldLevel, new: xpResult.newLevel });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkInView]);

  // Reschedule daily reminders whenever quest/habits/faithful status changes
  useEffect(() => {
    if (!hasCompletedOnboarding || !canNotify()) return;
    const questDetail = dailyQuest ? getQuestById(dailyQuest.questId) ?? null : null;
    scheduleDailyReminders(
      questDetail,
      dailyQuest?.status ?? "available",
      selectedHabitIds.length,
      summary.isFaithfulDay,
    );
    return () => { clearScheduledDailyReminders(); };
  }, [dailyQuest, selectedHabitIds.length, summary.isFaithfulDay, hasCompletedOnboarding]);

  const gameStats = useMemo(
    () => getGameStats(rawStats.totalXP, rawStats.streak, rawStats.longestStreak, rawStats.lastCheckinDate),
    [rawStats],
  );


  useEffect(() => {
    const weakest = [...summary.categoryScores].sort((a, b) => a.completionRate - b.completionRate)[0];
    if (!weakest || weakest.completionRate >= 50) return;
    if (!canNotify()) return;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000);
    const tip = getTipForCategory(weakest.category, dayOfYear);
    if (tip) scheduleReminderNotification(weakest.category, tip, "19:00", rawStats.streak);
  }, [summary.categoryScores]);

  const handleAddIntention = (habit: Habit) => {
    const intention: PinnedIntention = {
      habitId: habit.id,
      habitLabel: habit.label,
      habitKind: habit.kind,
      category: habit.category,
      pinnedAt: new Date().toISOString(),
      reminderTimes: DEFAULT_REMINDER_TIMES,
    };
    const updated = addIntention(intention, intentions);
    if (updated) {
      saveIntentions(updated);
      setIntentions(updated);
      scheduleIntentionReminders(updated.intentions);
    }
  };

  const handleRemoveIntention = (habitId: string) => {
    const updated = removeIntention(habitId, intentions);
    saveIntentions(updated);
    setIntentions(updated);
    scheduleIntentionReminders(updated.intentions);
  };

  const handleUpdateTime = (time: string) => {
    const updated = updateCustomTimeForAll(time, intentions);
    saveIntentions(updated);
    setIntentions(updated);
    scheduleIntentionReminders(updated.intentions);
  };

  const handleRequestNotifications = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    if (granted && intentions.intentions.length > 0) {
      scheduleIntentionReminders(intentions.intentions);
    }
    return granted;
  };

  const completeOnboarding = (answers: OnboardingAnswers) => {
    window.localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    window.localStorage.setItem(ONBOARDING_ANSWERS_KEY, JSON.stringify(answers));
    setHasCompletedOnboarding(true);
    setActiveTab("home");
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    saveUserProfile(profile);
    setUserProfile(profile);
  };

  const handleAcceptQuest = () => {
    localStorage.setItem(`optima_quest_acceptance_shown_${getTodayString()}`, "true");
    startQuest();
    setShowQuestAcceptance(false);
    const updated = loadDailyQuest();
    if (updated) setDailyQuest(updated);
  };

  const handleSwapQuest = () => {
    if (questSwapsRemaining <= 0) return;
    const current = loadDailyQuest();
    const recentIds = loadQuestHistory().slice(-7).map((q) => q.questId);
    if (current?.questId) recentIds.push(current.questId);
    const candidates = quests.filter((q) => !recentIds.includes(q.id));
    if (candidates.length === 0) return;
    const newQuestId = candidates[Math.floor(Math.random() * Math.min(3, candidates.length))].id;
    const newDaily: DailyQuest = { date: getTodayString(), questId: newQuestId, status: "available" };
    saveDailyQuest(newDaily);
    setDailyQuest(newDaily);
    setQuestSwapsRemaining(0);
  };

  const handleDeclineQuest = () => {
    localStorage.setItem(`optima_quest_acceptance_shown_${getTodayString()}`, "true");
    setShowQuestAcceptance(false);
    if (dailyQuest) {
      saveDailyQuest({ ...dailyQuest, status: "skipped" });
      const updated = loadDailyQuest();
      if (updated) setDailyQuest(updated);
    }
  };

  const handleStartQuest = () => {
    startQuest();
    const updated = loadDailyQuest();
    if (updated) setDailyQuest(updated);
  };

  const handleCompleteQuest = () => {
    completeQuest();
    const updated = loadDailyQuest();
    if (!updated) return;
    setDailyQuest(updated);
    const qd = getQuestById(updated.questId);
    if (qd) {
      setQuestBonusCategory(qd.category);
      const xpResult = awardXP(qd.pointsReward, "daily_quest");
      setRawStats(loadGameStats());
      if (xpResult.leveledUp) {
        setLevelUpData({ old: xpResult.oldLevel, new: xpResult.newLevel });
      }
    }
  };

  const handleSkipQuest = () => {
    skipQuest();
    const updated = loadDailyQuest();
    if (updated) setDailyQuest(updated);
  };

  const resetOnboarding = () => {
    window.localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    window.localStorage.removeItem(ONBOARDING_ANSWERS_KEY);
    setHasCompletedOnboarding(false);
    setActiveTab("home");
  };

  const simulateNewDay = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    window.localStorage.setItem("optima_today_date", str);
    window.location.reload();
  };

  function startPillarSession(category: Category) {
    const pillarHabits = todayHabits.filter((h) => h.category === category);
    const positive = pillarHabits.filter((h) => h.kind === "positive");
    const drains = pillarHabits.filter((h) => h.kind === "drain");
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    setActivePillar(category);
    setSessionHabits([...positive, ...drains]);
    setSessionIndex(0);
    setSessionAnswers({});
    setShowReaction(false);
    setCheckInView("session");
  }

  function advanceToNextStep(idx: number, len: number) {
    if (idx < len - 1) {
      setSessionIndex(idx + 1);
    } else {
      setCheckInView("complete");
    }
  }

  function handleAnswer(answered: boolean) {
    const habit = sessionHabits[sessionIndex];
    if (!habit) return;

    setSessionAnswers((prev) => ({ ...prev, [habit.id]: answered }));

    if (answered) {
      setSelectedHabitIds((prev) => (prev.includes(habit.id) ? prev : [...prev, habit.id]));
    } else {
      setSelectedHabitIds((prev) => prev.filter((id) => id !== habit.id));
    }

    setOptiReaction(getOptiReaction(habit, answered));
    setShowReaction(true);

    const capturedIndex = sessionIndex;
    const capturedLength = sessionHabits.length;
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = setTimeout(() => {
      setShowReaction(false);
      advanceToNextStep(capturedIndex, capturedLength);
    }, 1500);
  }

  function skipHabit() {
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    setShowReaction(false);
    advanceToNextStep(sessionIndex, sessionHabits.length);
  }

  if (!hasCheckedOnboarding) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-parchment-100 dark:bg-[#07070a]">
        <div className="text-center">
          <p className="font-serif text-xs font-semibold uppercase tracking-[0.34em] text-forest-600 dark:text-emerald-200/60">Óptima</p>
          <p className="mt-3 text-sm text-stone-400 dark:text-white/45">Preparing your check-in...</p>
        </div>
      </main>
    );
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  if (isSabbath) {
    return <SabbathScreen />;
  }

  const mood = summary.rating.companionMood;
  const completedPillarsCount = summary.categoryScores.filter((cs) => cs.presenceAchieved).length;

  // Session view derived
  const currentHabit = sessionHabits[sessionIndex] ?? null;
  const isDrainHabit = currentHabit?.kind === "drain";
  const sessionMood: CompanionMood = currentHabit
    ? showReaction
      ? isDrainHabit
        ? sessionAnswers[currentHabit.id] ? "Pressing On" : "Flourishing"
        : sessionAnswers[currentHabit.id] ? "Flourishing" : "Be Still"
      : isDrainHabit ? "Be Still" : "Faithful"
    : "Faithful";

  // Complete view derived
  const sessionYesPositive = sessionHabits.filter(
    (h) => h.kind === "positive" && sessionAnswers[h.id] === true,
  );

  // Home tab Opti message — intention-specific when intentions are set
  const homeHour = new Date().getHours();
  const homeTimeStr = homeHour < 12 ? "08:00" : homeHour < 17 ? "12:00" : "19:00";
  const optiHomeMessage = intentions.intentions.length > 0
    ? getIntentionMessage(intentions.intentions[0], homeTimeStr)
    : getAdaptiveCompanionMessage(mood, userProfile);

  // Pillar selection speech bubble
  const hour = new Date().getHours();
  const optiMessage = hour < 12
    ? "Let's start your day well."
    : hour < 17
      ? "How's your day unfolding?"
      : "Let's reflect on your day.";

  return (
    <main className="min-h-screen bg-parchment-100 text-stone-900 dark:bg-[#07070a] dark:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-4 pt-5">
        <header className="mb-3 flex items-center justify-between">
          <p className="font-serif text-[0.6rem] font-bold uppercase tracking-[0.4em] text-stone-400 dark:text-white/28">
            Óptima
          </p>
          {activeTab === "home" ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={simulateNewDay}
                className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] text-stone-400 transition hover:text-stone-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/30 dark:hover:text-white/60"
                title="Simulate new day (debug)"
              >
                ⏭ New day
              </button>
              <button
                type="button"
                onClick={() => setShowFaithfulCelebration(true)}
                className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] text-stone-300 transition hover:text-stone-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/20"
                title="Test faithful day celebration (debug)"
              >
                ⟳ test celebration
              </button>
              <button
                type="button"
                onClick={() => setShowMyPractices(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-400 transition hover:text-stone-600 dark:bg-white/[0.06] dark:text-white/30 dark:hover:text-white/60"
                aria-label="My Practices"
              >
                ⚙
              </button>
            </div>
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
          {activeTab === "home" && (
            <div className="flex flex-col items-center pb-4">
              <>
                {!notifAsked && <NotificationSetup onComplete={() => setNotifAsked(true)} />}

                {showProfilePrompt && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-3 w-full rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-forest-700">
                          ✦ Personalize your experience
                        </p>
                        <p className="mt-0.5 text-[11px] leading-5 text-stone-500">
                          Tell me a little about your life so I can walk alongside you better.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.setItem("optima_profile_completed", "true");
                          setShowProfilePrompt(false);
                        }}
                        className="shrink-0 text-xs text-stone-300 hover:text-stone-500"
                      >
                        ✕
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfilePrompt(false);
                        setShowMyPractices(true);
                      }}
                      className="mt-2 w-full rounded-full bg-forest-700 py-2 text-xs font-black text-white"
                    >
                      Set up my profile →
                    </button>
                  </motion.div>
                )}

                  {/* 1. Opti — center stage */}
                  <div className="mt-4 mb-1 w-full">
                    <Companion mood={mood} size="lg" />
                  </div>

                  {/* 2. State label + gradient bar — unified block */}
                  <div className="mt-2 w-full">
                    <motion.h1
                      key={mood}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "tween", duration: 0.4 }}
                      className={`mb-3 text-center font-serif text-3xl font-black tracking-tight ${scoreColor[mood]}`}
                    >
                      {stateLabels[mood]}{" "}
                      <span className="ml-1 text-2xl">{moodIndicator[mood]}</span>
                    </motion.h1>

                    <div className="mb-1.5 flex items-center justify-between px-1">
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-white/30">
                        Today&apos;s Walk
                      </span>
                      <span className={`font-serif font-bold text-sm ${scoreColor[mood]}`}>
                        {summary.score}
                      </span>
                    </div>

                    <div className="h-3 w-full overflow-hidden rounded-full bg-stone-100 shadow-inner dark:bg-white/10">
                      <motion.div
                        className="relative h-full rounded-full"
                        style={{ background: "linear-gradient(to right, #40916c, #60a5fa, #a78bfa, #fb923c, #f472b4)" }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${summary.score}%` }}
                        transition={{ type: "tween", duration: 1.0, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ type: "tween", duration: 2.0, delay: 1.4, ease: "easeInOut" }}
                        />
                      </motion.div>
                    </div>

                    <div className="mt-3 flex justify-center">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${ratingBarBadge[summary.rating.label]}`}>
                        {summary.rating.label}
                      </span>
                    </div>

                    <p className="mt-2 text-center text-[10px] leading-5 text-stone-400 dark:text-white/30">
                      This reflects stewardship, not your worth before God.
                    </p>

                    {summary.isFaithfulDay && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, type: "tween" }}
                        className="mt-2 text-center font-serif text-[11px] font-semibold text-forest-600 dark:text-emerald-400"
                      >
                        ✦ You showed up across your whole life today.
                      </motion.p>
                    )}
                  </div>

                  {/* 3. Companion message — elegant text, no card */}
                  <motion.div
                    key={`msg-${mood}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mb-1 mt-5 px-6 text-center"
                  >
                    <p className="mx-auto max-w-[280px] font-serif text-sm italic leading-7 text-stone-500 dark:text-white/50">
                      {optiHomeMessage}
                    </p>
                  </motion.div>

                  {/* 4. Five pillar bars — elegant, compact */}
                  <div className="mt-5 w-full">
                    <div className="mb-3 flex items-center justify-between px-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400 dark:text-white/30">
                        Five Pillars
                      </p>
                      {summary.isFaithfulDay && (
                        <p className="text-[9px] font-bold tracking-wider text-forest-600 dark:text-emerald-400">
                          All present
                        </p>
                      )}
                    </div>
                    <div className="space-y-2.5">
                      {summary.categoryScores.map((cs, i) => {
                        const pb = pillarBarConfig[cs.category];
                        return (
                          <motion.div
                            key={cs.category}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + i * 0.06, type: "tween", duration: 0.4 }}
                            className="flex items-center gap-3"
                          >
                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${pillarCircleClass[cs.category]}`}>
                              {categoryEmoji[cs.category]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-[11px] font-bold tracking-wide ${pb.nameColor}`}>
                                {cs.category}
                              </p>
                              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-white/10">
                                <motion.div
                                  className={`h-full rounded-full ${pb.barColor}`}
                                  style={{ boxShadow: `0 0 6px ${pb.glow.replace("0.5)", "0.4)")}` }}
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${cs.completionRate}%` }}
                                  transition={{ type: "tween", duration: 0.7, delay: 0.7 + i * 0.06, ease: "easeOut" }}
                                />
                              </div>
                            </div>
                            <div className="w-6 shrink-0 text-right">
                              {cs.presenceAchieved && (
                                <span className="text-xs text-forest-500 dark:text-emerald-400">✦</span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. Daily Quest */}
                  {dailyQuest && getQuestById(dailyQuest.questId) && (
                    <div className="mt-5 w-full">
                      <DailyQuestCard
                        quest={getQuestById(dailyQuest.questId)!}
                        dailyQuest={dailyQuest}
                        onStart={handleStartQuest}
                        onComplete={handleCompleteQuest}
                        onSkip={handleSkipQuest}
                      />
                    </div>
                  )}

                  {/* 6. Daily Intention Card */}
                  <div className="mt-5 w-full">
                    <DailyIntentionCard
                      intentions={intentions.intentions}
                      isPremium={isPremium}
                      onAdd={() => setShowIntentionPicker(true)}
                      onRemove={handleRemoveIntention}
                      onUpdateTime={handleUpdateTime}
                      onRequestNotifications={handleRequestNotifications}
                    />
                  </div>

                  {/* 6. Streak + level — minimal footer */}
                  <div className="mt-3 mb-1 flex items-center justify-center gap-3">
                    <span className={`text-[10px] font-semibold ${gameStats.currentStreak > 0 ? "text-terra-500 dark:text-amber-300" : "text-stone-400 dark:text-white/30"}`}>
                      {gameStats.currentStreak > 0 ? `✦ ${gameStats.currentStreak} day${gameStats.currentStreak !== 1 ? "s" : ""} walking` : "Begin your walk today"}
                    </span>
                    <span className="text-stone-300 dark:text-white/20">·</span>
                    <span className="flex items-center gap-1">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ backgroundColor: `${gameStats.level.color}1a`, color: gameStats.level.color }}
                      >
                        Lv.{gameStats.level.tier}
                      </span>
                      <span className="text-[10px] font-semibold" style={{ color: gameStats.level.color }}>
                        {gameStats.level.stageName} {ROMAN_NUMERALS[gameStats.level.subLevel - 1]}
                      </span>
                    </span>
                  </div>

                  {/* Smart nudge */}
                  {!nudgeDismissed && (
                    <div className="mt-3 w-full">
                      <SmartNudge
                        categoryScores={summary.categoryScores}
                        onDismiss={() => setNudgeDismissed(true)}
                        onCheckIn={() => setActiveTab("check-in")}
                      />
                    </div>
                  )}

                  {/* 7. CTA */}
                  <motion.button
                    type="button"
                    onClick={() => setActiveTab("check-in")}
                    whileTap={{ scale: 0.97 }}
                    animate={selectedHabitIds.length === 0 ? {
                      boxShadow: ["0 0 0 0 rgba(45,106,79,0.3)", "0 0 0 8px rgba(45,106,79,0)", "0 0 0 0 rgba(45,106,79,0)"],
                    } : {
                      boxShadow: "0 4px 12px rgba(45,106,79,0.15)",
                    }}
                    transition={selectedHabitIds.length === 0 ? { duration: 1.8, repeat: Infinity } : {}}
                    className="mt-4 w-full rounded-full bg-forest-700 py-4 text-sm font-black text-white shadow-md shadow-forest-700/15 dark:bg-gradient-to-r dark:from-emerald-400 dark:to-cyan-400 dark:text-zinc-900"
                  >
                    {selectedHabitIds.length === 0 ? "Begin today's check-in →" : "Continue today's check-in →"}
                  </motion.button>
              </>
            </div>
          )}

          {/* ── CHECK-IN TAB ──────────────────────────────────────────── */}
          {activeTab === "check-in" && (
            <div className="pb-32">
              <AnimatePresence mode="wait">

                {/* VIEW: PILLAR SELECTION */}
                {checkInView === "pillars" && (
                  <motion.div
                    key="pillars"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Opti + speech bubble */}
                    <div className="mb-4 flex flex-col items-center">
                      <div className="mb-3 rounded-2xl border border-stone-100 bg-white px-4 py-2 shadow-sm">
                        <p className="text-xs text-stone-600 text-center">{optiMessage}</p>
                      </div>
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Companion mood="Faithful" size="sm" />
                      </motion.div>
                    </div>

                    <p className="mt-2 text-center font-serif text-2xl font-black text-stone-900 dark:text-white">
                      Today&apos;s Check-in
                    </p>

                    {/* Overall progress dots */}
                    <div className="mt-3 mb-6 flex flex-col items-center">
                      <div className="flex gap-3">
                        {categories.map((cat) => {
                          const cs = summary.categoryScores.find((s) => s.category === cat)!;
                          return (
                            <span
                              key={cat}
                              className="h-3 w-3 rounded-full transition-all"
                              style={
                                cs.presenceAchieved
                                  ? { backgroundColor: pillarConfig[cat].hex, boxShadow: `0 0 8px ${pillarConfig[cat].hex}88` }
                                  : { backgroundColor: "#e7e5e4" }
                              }
                            />
                          );
                        })}
                      </div>
                      <p className="mt-2 text-xs text-stone-400 text-center">
                        {completedPillarsCount} of 5 pillars visited today
                      </p>
                    </div>

                    {/* Pillar cards */}
                    {(() => {
                      const isSunday = new Date().getDay() === 0;
                      return categories.map((cat) => {
                        const cs = summary.categoryScores.find((s) => s.category === cat)!;
                        const isComplete = cs.presenceAchieved;
                        const answeredCount = activePillar === cat ? Object.keys(sessionAnswers).length : 0;
                        const todayCount = todayHabits.filter((h) => h.category === cat).length;
                        const isInProgress = activePillar === cat && answeredCount > 0 && !isComplete;

                        return (
                          <motion.button
                            key={cat}
                            type="button"
                            onClick={() => startPillarSession(cat)}
                            whileTap={{ scale: 0.98 }}
                            className="mb-3 flex w-full items-center gap-4 rounded-[1.5rem] border border-stone-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]"
                          >
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${pillarSubtleBg[cat]}`}>
                              {categoryEmoji[cat]}
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                              <p className="font-black text-sm text-stone-800 dark:text-white">{cat}</p>
                              {isComplete ? (
                                <p className="text-xs font-semibold text-forest-600 dark:text-emerald-400">✦ Showing up here today</p>
                              ) : isInProgress ? (
                                <p className="text-xs text-amber-600">{answeredCount} of {todayCount} habits answered</p>
                              ) : (
                                <>
                                  <p className="text-[10px] text-stone-400">{todayCount} to check today</p>
                                  {cat === "Spiritual" && isSunday && (
                                    <p className="text-[9px] font-bold text-violet-600 mt-0.5">✦ Sunday — 2 extra weekly practices</p>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="shrink-0">
                              {isComplete ? (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-100">
                                  <span className="text-xs font-black text-forest-600">✓</span>
                                </div>
                              ) : isInProgress ? (
                                <span className="block h-2.5 w-2.5 rounded-full bg-amber-400" />
                              ) : (
                                <span className="text-xl text-stone-300">›</span>
                              )}
                            </div>
                          </motion.button>
                        );
                      });
                    })()}

                    {/* Bottom CTA */}
                    <div className="mt-2">
                      {completedPillarsCount === 5 ? (
                        <div className="rounded-[1.5rem] border border-forest-200 bg-forest-50 p-4 text-center">
                          <p className="font-serif font-semibold text-forest-700">
                            ✦ You showed up across your whole life today.
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveTab("home")}
                            className="mt-3 text-sm font-bold text-forest-600"
                          >
                            See my score →
                          </button>
                        </div>
                      ) : (
                        <p className="text-center text-xs text-stone-400">
                          Complete all five pillars for your full daily score.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* VIEW: SESSION */}
                {checkInView === "session" && activePillar && currentHabit && (
                  <motion.div
                    key="session"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Back button */}
                    <button
                      type="button"
                      onClick={() => setCheckInView("pillars")}
                      className="mb-4 text-sm font-semibold text-stone-400 hover:text-stone-600 dark:text-white/30 dark:hover:text-white/60"
                    >
                      ← {activePillar}
                    </button>

                    {/* Dot progress trail */}
                    <div className="mb-2 flex flex-wrap justify-center gap-2">
                      {sessionHabits.map((_, i) => {
                        const isPast = i < sessionIndex;
                        const isCurrent = i === sessionIndex;
                        return (
                          <motion.span
                            key={i}
                            className="rounded-full"
                            style={{
                              width: isCurrent ? 12 : 8,
                              height: isCurrent ? 12 : 8,
                              backgroundColor: isPast || isCurrent ? pillarConfig[activePillar].hex : "#e7e5e4",
                            }}
                            animate={isCurrent ? { scale: [1, 1.3, 1] } : {}}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                          />
                        );
                      })}
                    </div>
                    <p className="mb-5 text-center text-[10px] text-stone-400">
                      {sessionIndex + 1} of {sessionHabits.length}
                    </p>

                    {/* Opti */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={{ y: [0, -16, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Companion mood={sessionMood} size="lg" />
                      </motion.div>

                      <AnimatePresence>
                        {showReaction && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.25 }}
                            className="mt-3 max-w-[260px] rounded-2xl border border-stone-100 bg-white px-4 py-3 text-center shadow-sm"
                          >
                            <p className="font-serif text-sm text-stone-700">{optiReaction}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Habit card */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={sessionIndex}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.22 }}
                        className="mt-5"
                      >
                        <div
                          className={`mx-1 rounded-[2rem] border p-6 text-center shadow-md ${
                            isDrainHabit
                              ? "border-rose-100 bg-rose-50"
                              : "border-stone-100 bg-white dark:border-white/10 dark:bg-white/[0.06]"
                          }`}
                        >
                          <p
                            className={`mb-3 text-[10px] font-black uppercase tracking-widest ${
                              isDrainHabit ? "text-terra-500" : "text-forest-600"
                            }`}
                          >
                            {isDrainHabit ? "FREEDOM FROM" : "PRACTICE"}
                          </p>
                          <p className="font-serif text-xl font-bold leading-8 text-stone-900 dark:text-white">
                            {currentHabit.label}
                          </p>
                          {currentHabit.scriptureRef && (
                            <p className="mt-2 text-xs italic text-stone-400">— {currentHabit.scriptureRef}</p>
                          )}
                          {currentHabit.rhythm && (
                            <span
                              className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                currentHabit.rhythm === "daily"
                                  ? "bg-forest-50 text-forest-600"
                                  : currentHabit.rhythm === "weekly"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-amber-50 text-amber-600"
                              }`}
                            >
                              {currentHabit.rhythm}
                            </span>
                          )}
                          <p className="mt-4 text-center text-sm leading-6 text-stone-500 dark:text-white/50">
                            {isDrainHabit ? "Did this have a hold on you today?" : "Did you do this today?"}
                          </p>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Yes / No buttons */}
                    <div className="mt-6 flex flex-col gap-3">
                      <motion.button
                        type="button"
                        disabled={showReaction}
                        whileTap={showReaction ? {} : { scale: 0.97 }}
                        onClick={() => handleAnswer(true)}
                        className={`w-full rounded-full py-4 text-base font-black text-white transition ${
                          isDrainHabit ? "bg-rose-500" : "bg-forest-600"
                        } disabled:opacity-50`}
                      >
                        {isDrainHabit ? "Yes, this had a hold on me" : "Yes, I did this ✓"}
                      </motion.button>

                      <motion.button
                        type="button"
                        disabled={showReaction}
                        whileTap={showReaction ? {} : { scale: 0.97 }}
                        onClick={() => handleAnswer(false)}
                        className="w-full rounded-full border border-stone-200 bg-parchment-200 py-4 text-base font-black text-stone-600 transition disabled:opacity-50"
                      >
                        {isDrainHabit ? "No, I stayed free" : "Not today"}
                      </motion.button>

                      <button
                        type="button"
                        onClick={skipHabit}
                        className="mt-1 text-center text-xs text-stone-300 underline"
                      >
                        Skip this one
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* VIEW: COMPLETE */}
                {checkInView === "complete" && activePillar && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    {/* Opti */}
                    <motion.div
                      animate={{ y: [0, -16, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Companion mood="Flourishing" size="lg" />
                    </motion.div>

                    {/* Header */}
                    <motion.p
                      initial={{ scale: 0.8 }}
                      animate={{ scale: [0.8, 1.1, 1] }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="mt-4 text-center font-serif text-3xl font-black"
                      style={{ color: pillarConfig[activePillar].hex }}
                    >
                      ✦ {activePillar} complete.
                    </motion.p>

                    {/* Scripture */}
                    <p className="mx-auto mt-4 max-w-[280px] text-center font-serif text-base italic leading-8 text-stone-600 dark:text-white/60">
                      &ldquo;{pillarCelebrationVerse[activePillar].quote}&rdquo;
                      <br />
                      <span className="not-italic text-sm text-stone-400">— {pillarCelebrationVerse[activePillar].ref}</span>
                    </p>

                    {/* Stats */}
                    <div className="mt-6 w-full rounded-[1.5rem] border border-stone-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
                      <div className="flex items-center justify-around">
                        <div className="text-center">
                          <p className="font-serif text-3xl font-black" style={{ color: pillarConfig[activePillar].hex }}>
                            {sessionYesPositive.length}
                          </p>
                          <p className="mt-1 text-xs text-stone-400">practices logged</p>
                        </div>
                        <div className="h-10 w-px bg-stone-100 dark:bg-white/10" />
                        <div className="text-center">
                          <p className="font-serif text-3xl font-black text-stone-800 dark:text-white">
                            {sessionYesPositive.reduce((s, h) => s + h.points, 0)}
                          </p>
                          <p className="mt-1 text-xs text-stone-400">points today</p>
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <button
                      type="button"
                      onClick={() => {
                        if (completedPillarsCount === 5) {
                          setActiveTab("home");
                        } else {
                          setCheckInView("pillars");
                        }
                      }}
                      className="mt-6 w-full rounded-full bg-forest-700 py-4 text-sm font-black text-white"
                    >
                      {completedPillarsCount === 5 ? "See my full score →" : "Continue to next pillar →"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCheckInView("pillars")}
                      className="mt-3 text-center text-sm font-semibold text-stone-400"
                    >
                      Back to all pillars
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          )}

          {/* ── JOURNEY TAB ───────────────────────────────────────────── */}
          {activeTab === "journey" && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: "✦", value: String(gameStats.currentStreak), label: "Days Walking", sub: `Best: ${gameStats.longestStreak}d`, iconCls: "text-terra-500 dark:text-amber-300" },
                  { icon: "⚡", value: String(gameStats.totalXP), label: "Total XP", sub: undefined as string | undefined, iconCls: "" },
                ].map((card) => (
                  <div key={card.label} className="flex flex-col items-center gap-1 rounded-2xl border border-stone-100 bg-white p-3 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:shadow-none">
                    <span className={`text-lg ${card.iconCls}`}>{card.icon}</span>
                    <span className="font-serif text-xl font-bold text-stone-900 dark:text-white">{card.value}</span>
                    <span className="text-[0.6rem] text-stone-400 dark:text-white/40">{card.label}</span>
                    {card.sub && <span className="text-[0.55rem] text-stone-300 dark:text-white/25">{card.sub}</span>}
                  </div>
                ))}
                {/* Level stat card — styled with level color */}
                <div
                  className="flex flex-col items-center gap-1 rounded-2xl p-3 text-center shadow-sm"
                  style={{ backgroundColor: `${gameStats.level.color}18`, border: `1px solid ${gameStats.level.color}40` }}
                >
                  <span className="text-lg">🏆</span>
                  <span className="font-serif text-xl font-bold" style={{ color: gameStats.level.color }}>
                    Lv.{gameStats.level.tier}
                  </span>
                  <span className="text-[0.6rem] font-bold" style={{ color: gameStats.level.color }}>
                    {gameStats.level.stageName} · {ROMAN_NUMERALS[gameStats.level.subLevel - 1]}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
                {/* Level title */}
                <div className="mb-1 flex items-end gap-2">
                  <span className="font-serif text-3xl font-black leading-none" style={{ color: gameStats.level.color }}>
                    Lv.{gameStats.level.tier}
                  </span>
                  <div className="pb-0.5">
                    <p className="text-xs font-bold leading-tight" style={{ color: gameStats.level.color }}>
                      {gameStats.level.stageName} · {ROMAN_NUMERALS[gameStats.level.subLevel - 1]}
                    </p>
                    <p className="text-[10px] italic text-stone-400 leading-tight">
                      {gameStats.level.fullTitle.split(" — ")[1]}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: gameStats.level.color, boxShadow: `0 0 12px ${gameStats.level.color}88` }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${gameStats.xpProgressPercent}%` }}
                    transition={{ type: "spring", stiffness: 55, damping: 13, delay: 0.2 }}
                  />
                </div>
                <p className="mt-1 text-xs text-stone-400 dark:text-white/40">
                  {gameStats.xpToNextLevel > 0 ? `${gameStats.xpToNextLevel} XP to next level` : "Max level reached"}
                </p>

                {/* Stage progress dots */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((sub) => {
                    const isPast = sub < gameStats.level.subLevel;
                    const isCurrent = sub === gameStats.level.subLevel;
                    return (
                      <motion.span
                        key={sub}
                        className="rounded-full"
                        style={{
                          width: isCurrent ? 10 : 8,
                          height: isCurrent ? 10 : 8,
                          backgroundColor: isPast || isCurrent ? gameStats.level.color : "#e7e5e4",
                          boxShadow: isCurrent ? `0 0 8px ${gameStats.level.color}` : undefined,
                        }}
                        animate={isCurrent ? { scale: [1, 1.25, 1] } : {}}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                      />
                    );
                  })}
                </div>
                <p className="mt-2 text-center text-[10px] text-stone-400">
                  Stage {gameStats.level.stage} of 10 — {gameStats.level.stageName}
                </p>

                {/* Scripture */}
                <p className="mt-3 text-center font-serif text-[10px] italic leading-5 text-stone-400">
                  {gameStats.level.scripture}
                </p>
              </div>

              <div>
                <p className="mb-3 text-[0.58rem] font-bold uppercase tracking-[0.32em] text-stone-400 dark:text-white/28">Life Area Snapshot</p>
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
                        <span className={`w-24 shrink-0 text-right text-[0.6rem] font-bold ${strength.cls}`}>{strength.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-3 text-[0.58rem] font-bold uppercase tracking-[0.32em] text-stone-400 dark:text-white/28">Your Walk</p>
                {history.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 rounded-3xl border border-stone-100 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:shadow-none">
                    <Companion mood="Faithful" size="sm" />
                    <p className="font-serif text-sm font-semibold text-stone-700 dark:text-white">Your walk hasn&apos;t been recorded yet.</p>
                    <p className="text-xs italic leading-5 text-stone-400 dark:text-white/35">
                      &ldquo;The path of the righteous is like the morning sun, shining ever brighter.&rdquo;
                      <br />— Proverbs 4:18
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.slice(0, isPremium ? undefined : 7).map((record) => {
                      const moodColor = stateColors[record.companionMood];
                      return (
                        <article key={record.date} className="rounded-3xl border border-stone-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:shadow-none">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-stone-800 dark:text-white">{record.dateLabel}</p>
                              <div className="mt-0.5 flex items-center gap-2">
                                <span className={`text-xs font-bold ${moodColor}`}>{record.companionMood}</span>
                                {record.isFaithfulDay && (
                                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">Faithful</span>
                                )}
                              </div>
                              <div className="mt-2 flex gap-1.5">
                                {record.categoryScores.map((cs) => (
                                  <div key={cs.category} className="flex flex-col items-center" title={`${cs.category}: ${Math.round(cs.completionRate)}%`}>
                                    <div className="h-6 w-2 overflow-hidden rounded-full bg-stone-100 dark:bg-white/10">
                                      <div
                                        className={`w-full rounded-full ${pillarConfig[cs.category].colorClass}`}
                                        style={{ height: `${cs.completionRate}%`, marginTop: `${100 - cs.completionRate}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className={`font-serif text-xl font-black ${moodColor}`}>{record.score}</p>
                              <p className="text-[10px] text-stone-400 dark:text-white/45">{record.ratingLabel}</p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                    {!isPremium && history.length > 7 && (
                      <div className="rounded-3xl border border-stone-100 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:shadow-none">
                        <p className="text-2xl">🔒</p>
                        <p className="mt-2 font-serif text-sm font-bold text-stone-800 dark:text-white">Your full history awaits</p>
                        <p className="mt-1 text-xs text-stone-500 dark:text-white/45">Upgrade to Óptima Premium to see your complete walk.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <AnimatePresence>
        {showQuestAcceptance && dailyQuest && getQuestById(dailyQuest.questId) && (
          <QuestAcceptanceModal
            quest={getQuestById(dailyQuest.questId)!}
            reasonShown={getQuestReason(getQuestById(dailyQuest.questId)!, userProfile, summary)}
            swapsRemaining={questSwapsRemaining}
            onAccept={handleAcceptQuest}
            onSwap={handleSwapQuest}
            onDecline={handleDeclineQuest}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {levelUpData && (
          <LevelUpCelebration
            oldLevel={levelUpData.old}
            newLevel={levelUpData.new}
            onClose={() => setLevelUpData(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showMyPractices && (
          <MyPracticesScreen
            allHabits={habits}
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onOpenSettings={() => { setShowMyPractices(false); setShowSettings(true); }}
            onClose={() => setShowMyPractices(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showFaithfulCelebration && (
          <FaithfulDayCelebration
            pillarsPresent={summary.pillarsPresent}
            score={summary.score}
            onClose={() => setShowFaithfulCelebration(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedCategory && (
          <CategorySheet
            category={selectedCategory}
            categoryScore={summary.categoryScores.find((c) => c.category === selectedCategory)!}
            habits={habits}
            selectedHabitIds={selectedHabitIds}
            onClose={() => setSelectedCategory(null)}
            onGoToCheckIn={() => { setSelectedCategory(null); setActiveTab("check-in"); }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showIntentionPicker && (
          <IntentionPicker
            allHabits={habits}
            currentIntentions={intentions.intentions}
            onSelect={(habit) => {
              handleAddIntention(habit);
              setShowIntentionPicker(false);
            }}
            onClose={() => setShowIntentionPicker(false)}
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed bottom-16 left-0 right-0 z-10 h-12 bg-gradient-to-t from-parchment-100 to-transparent dark:from-[#07070a]" />
    </main>
  );
}
