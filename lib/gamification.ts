import type { GameStats, Level } from "@/types/optima";

export const GAME_STATS_KEY = "optima_game_stats";

const LEVELS: Level[] = [
  {
    tier: 1, title: "Seeker", minXP: 0, maxXP: 99, color: "#94a3b8",
    description: "I'm starting.",
    scripture: "Seek the Lord while He may be found. — Isaiah 55:6",
  },
  {
    tier: 2, title: "Sojourner", minXP: 100, maxXP: 299, color: "#a78bfa",
    description: "I'm walking.",
    scripture: "We are foreigners and strangers in your sight. — 1 Chronicles 29:15",
  },
  {
    tier: 3, title: "Apprentice", minXP: 300, maxXP: 699, color: "#60a5fa",
    description: "I'm learning.",
    scripture: "The fear of the Lord is the beginning of wisdom. — Proverbs 9:10",
  },
  {
    tier: 4, title: "Disciple", minXP: 700, maxXP: 1499, color: "#34d399",
    description: "I'm following.",
    scripture: "If anyone would come after me, let him deny himself, take up his cross daily, and follow me. — Luke 9:23",
  },
  {
    tier: 5, title: "Steward", minXP: 1500, maxXP: 2999, color: "#fbbf24",
    description: "I'm carrying weight.",
    scripture: "It is required of stewards that they be found faithful. — 1 Corinthians 4:2",
  },
  {
    tier: 6, title: "Servant", minXP: 3000, maxXP: 5999, color: "#fb923c",
    description: "I'm serving others.",
    scripture: "Whoever wants to become great among you must be your servant. — Matthew 20:26",
  },
  {
    tier: 7, title: "Faithful", minXP: 6000, maxXP: 11999, color: "#f59e0b",
    description: "I'm consistent.",
    scripture: "Well done, good and faithful servant. — Matthew 25:21",
  },
  {
    tier: 8, title: "Established", minXP: 12000, maxXP: 23999, color: "#d97706",
    description: "I'm rooted.",
    scripture: "Like a tree planted by streams of water, that yields its fruit in its season. — Psalm 1:3",
  },
  {
    tier: 9, title: "Shepherd", minXP: 24000, maxXP: 49999, color: "#92400e",
    description: "I'm leading others.",
    scripture: "Be shepherds of God's flock. — 1 Peter 5:2",
  },
  {
    tier: 10, title: "Living Sacrifice", minXP: 50000, maxXP: 999999, color: "#6b21a8",
    description: "I'm fully His.",
    scripture: "Present your bodies as a living sacrifice. — Romans 12:1",
  },
];

export function getLevel(totalXP: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getGameStats(
  totalXP: number,
  streak: number,
  longestStreak: number,
  lastCheckinDate = "",
): GameStats {
  const level = getLevel(totalXP);
  const nextLevel = LEVELS.find((l) => l.tier === level.tier + 1);
  const xpToNextLevel = nextLevel ? nextLevel.minXP - totalXP : 0;
  const xpInLevel = totalXP - level.minXP;
  const xpRange = level.maxXP - level.minXP;
  const xpProgressPercent = Math.min(100, Math.round((xpInLevel / xpRange) * 100));

  return {
    totalXP,
    currentStreak: streak,
    longestStreak,
    lastCheckinDate,
    level,
    xpToNextLevel,
    xpProgressPercent,
  };
}

export function awardXP(
  amount: number,
  _source: string,
): { newTotalXP: number; leveledUp: boolean; oldLevel: Level; newLevel: Level } {
  const raw = loadGameStats();
  const oldLevel = getLevel(raw.totalXP);
  const newTotalXP = raw.totalXP + amount;
  const newLevel = getLevel(newTotalXP);
  saveGameStats({ ...raw, totalXP: newTotalXP });
  return {
    newTotalXP,
    leveledUp: newLevel.tier > oldLevel.tier,
    oldLevel,
    newLevel,
  };
}

export function addXP(currentXP: number, scoreToday: number): number {
  const earned = Math.max(5, Math.round(scoreToday * 0.5));
  return currentXP + earned;
}

type RawStats = {
  totalXP: number;
  streak: number;
  longestStreak: number;
  lastCheckinDate: string;
};

const defaultRaw: RawStats = {
  totalXP: 0,
  streak: 0,
  longestStreak: 0,
  lastCheckinDate: "",
};

export function loadGameStats(): RawStats {
  if (typeof window === "undefined") return defaultRaw;
  try {
    const raw = window.localStorage.getItem(GAME_STATS_KEY);
    if (!raw) return defaultRaw;
    return { ...defaultRaw, ...(JSON.parse(raw) as Partial<RawStats>) };
  } catch {
    return defaultRaw;
  }
}

export function saveGameStats(stats: RawStats): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GAME_STATS_KEY, JSON.stringify(stats));
}

export const SABBATH_DAY_KEY = "optima_sabbath_day";

export function getSabbathDay(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(window.localStorage.getItem(SABBATH_DAY_KEY) ?? "0", 10);
}

export function setSabbathDay(dayOfWeek: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SABBATH_DAY_KEY, String(dayOfWeek));
}

export function isTodaySabbath(): boolean {
  return new Date().getDay() === getSabbathDay();
}

export function shouldCountStreakToday(sabbathDayOfWeek: number): boolean {
  return new Date().getDay() !== sabbathDayOfWeek;
}

export function isDateSabbath(dateStr: string, sabbathDayOfWeek: number): boolean {
  return new Date(dateStr + "T12:00:00").getDay() === sabbathDayOfWeek;
}

export function updateStreak(completedDate: string, sabbathDayOfWeek: number): void {
  const raw = loadGameStats();
  if (raw.lastCheckinDate === completedDate) return;
  if (isDateSabbath(completedDate, sabbathDayOfWeek)) return;

  const lastDate = raw.lastCheckinDate;
  let newStreak: number;

  if (!lastDate) {
    newStreak = 1;
  } else {
    const lastMs = new Date(lastDate + "T12:00:00").getTime();
    const currMs = new Date(completedDate + "T12:00:00").getTime();
    const diffDays = Math.round((currMs - lastMs) / 86_400_000);

    if (diffDays === 1) {
      newStreak = raw.streak + 1;
    } else if (diffDays === 2) {
      const gapDate = new Date(lastDate + "T12:00:00");
      gapDate.setDate(gapDate.getDate() + 1);
      const gapStr = gapDate.toISOString().slice(0, 10);
      newStreak = isDateSabbath(gapStr, sabbathDayOfWeek) ? raw.streak + 1 : 1;
    } else {
      newStreak = 1;
    }
  }

  saveGameStats({
    totalXP: raw.totalXP,
    streak: newStreak,
    longestStreak: Math.max(newStreak, raw.longestStreak),
    lastCheckinDate: completedDate,
  });
}
