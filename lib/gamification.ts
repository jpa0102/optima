import type { GameStats, Level } from "@/types/optima";

export const GAME_STATS_KEY = "optima_game_stats";

const LEVELS: Level[] = [
  { tier: 1, title: "Starter",    minXP: 0,    maxXP: 199,   color: "#94a3b8" },
  { tier: 2, title: "Building",   minXP: 200,  maxXP: 499,   color: "#34d399" },
  { tier: 3, title: "Consistent", minXP: 500,  maxXP: 999,   color: "#60a5fa" },
  { tier: 4, title: "Optimizing", minXP: 1000, maxXP: 1999,  color: "#a78bfa" },
  { tier: 5, title: "Thriving",   minXP: 2000, maxXP: 3999,  color: "#f59e0b" },
  { tier: 6, title: "Optimal",    minXP: 4000, maxXP: 99999, color: "#f97316" },
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
