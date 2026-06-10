import type { CategoryScore, DailyQuest, Quest, UserProfile } from "@/types/optima";
import { quests } from "@/data/quests";
import { getTodayString } from "./dailyStorage";

const DAILY_QUEST_KEY = "optima_daily_quest";
const QUEST_HISTORY_KEY = "optima_quest_history";

export function getTodayQuest(
  profile: UserProfile,
  categoryScores: CategoryScore[],
): DailyQuest {
  const saved = loadDailyQuest();
  if (saved && saved.date === getTodayString()) {
    return saved;
  }

  const questId = selectQuestForUser(profile, categoryScores);
  const newDaily: DailyQuest = {
    date: getTodayString(),
    questId,
    status: "available",
  };

  saveDailyQuest(newDaily);
  return newDaily;
}

function selectQuestForUser(
  profile: UserProfile,
  categoryScores: CategoryScore[],
): string {
  const recentQuests = loadQuestHistory()
    .slice(-7)
    .map((q) => q.questId);

  const candidates = quests.filter((q) => !recentQuests.includes(q.id));
  const pool = candidates.length > 0 ? candidates : quests;

  const weakestPillar = [...categoryScores].sort(
    (a, b) => a.completionRate - b.completionRate,
  )[0];

  const scored = pool.map((quest) => {
    let score = 0;

    if (quest.forStruggles && quest.forStruggles.length > 0) {
      const overlap = quest.forStruggles.filter((s) =>
        profile.currentStruggles.includes(s),
      ).length;
      score += overlap * 30;
    }

    if (quest.forLifeSeasons?.includes(profile.lifeSeason)) score += 20;
    if (quest.forFaithStages?.includes(profile.faithStage)) score += 15;
    if (quest.forWorkSituations?.includes(profile.workSituation)) score += 10;
    if (quest.forHealthConsiderations?.includes(profile.healthConsideration)) score += 10;

    if (weakestPillar && quest.category === weakestPillar.category) score += 25;

    score += Math.random() * 10;

    return { quest, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.quest.id ?? quests[0].id;
}

export function getQuestById(id: string): Quest | undefined {
  return quests.find((q) => q.id === id);
}

export function loadDailyQuest(): DailyQuest | null {
  try {
    const saved = localStorage.getItem(DAILY_QUEST_KEY);
    return saved ? (JSON.parse(saved) as DailyQuest) : null;
  } catch {
    return null;
  }
}

export function saveDailyQuest(quest: DailyQuest): void {
  try {
    localStorage.setItem(DAILY_QUEST_KEY, JSON.stringify(quest));
  } catch {
    // ignore
  }
}

export function startQuest(): void {
  const current = loadDailyQuest();
  if (!current) return;
  current.status = "in_progress";
  current.startedAt = new Date().toISOString();
  saveDailyQuest(current);
}

export function completeQuest(): void {
  const current = loadDailyQuest();
  if (!current) return;
  current.status = "completed";
  current.completedAt = new Date().toISOString();
  saveDailyQuest(current);

  const history = loadQuestHistory();
  history.push(current);
  try {
    localStorage.setItem(QUEST_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function skipQuest(): void {
  const current = loadDailyQuest();
  if (!current) return;
  current.status = "skipped";
  saveDailyQuest(current);
}

export function loadQuestHistory(): DailyQuest[] {
  try {
    const saved = localStorage.getItem(QUEST_HISTORY_KEY);
    return saved ? (JSON.parse(saved) as DailyQuest[]) : [];
  } catch {
    return [];
  }
}
