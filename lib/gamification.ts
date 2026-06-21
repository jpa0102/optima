import type { GameStats, Level, ScoreSummary } from "@/types/optima";

export const GAME_STATS_KEY = "optima_game_stats";

export const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V"] as const;

const SUB_PERSONALITIES = [
  "Just beginning",
  "Gaining steady ground",
  "Growing in resolve",
  "Becoming established",
  "On the edge of new growth",
] as const;

type StageConfig = { stageName: string; color: string; description: string; scripture: string };

const STAGE_CONFIGS: StageConfig[] = [
  { stageName: "Seeker",           color: "#94a3b8", description: "I'm starting.",          scripture: "Seek the Lord while He may be found. — Isaiah 55:6" },
  { stageName: "Sojourner",        color: "#a78bfa", description: "I'm walking.",            scripture: "We are foreigners and strangers in your sight. — 1 Chronicles 29:15" },
  { stageName: "Apprentice",       color: "#60a5fa", description: "I'm learning.",           scripture: "The fear of the Lord is the beginning of wisdom. — Proverbs 9:10" },
  { stageName: "Disciple",         color: "#34d399", description: "I'm following.",          scripture: "If anyone would come after me, let him deny himself, take up his cross daily, and follow me. — Luke 9:23" },
  { stageName: "Steward",          color: "#fbbf24", description: "I'm carrying weight.",    scripture: "It is required of stewards that they be found faithful. — 1 Corinthians 4:2" },
  { stageName: "Servant",          color: "#fb923c", description: "I'm serving others.",     scripture: "Whoever wants to become great among you must be your servant. — Matthew 20:26" },
  { stageName: "Faithful",         color: "#f59e0b", description: "I'm consistent.",         scripture: "Well done, good and faithful servant. — Matthew 25:21" },
  { stageName: "Established",      color: "#d97706", description: "I'm rooted.",             scripture: "Like a tree planted by streams of water, that yields its fruit in its season. — Psalm 1:3" },
  { stageName: "Shepherd",         color: "#92400e", description: "I'm leading others.",     scripture: "Be shepherds of God's flock. — 1 Peter 5:2" },
  { stageName: "Living Sacrifice", color: "#6b21a8", description: "I'm fully His.",          scripture: "Present your bodies as a living sacrifice. — Romans 12:1" },
];

const XP_RANGES: [number, number][] = [
  [0, 49],        [50, 119],      [120, 209],     [210, 319],     [320, 449],
  [450, 599],     [600, 779],     [780, 989],     [990, 1229],    [1230, 1499],
  [1500, 1799],   [1800, 2139],   [2140, 2519],   [2520, 2939],   [2940, 3399],
  [3400, 3899],   [3900, 4449],   [4450, 5049],   [5050, 5699],   [5700, 6399],
  [6400, 7149],   [7150, 7959],   [7960, 8829],   [8830, 9759],   [9760, 10749],
  [10750, 11809], [11810, 12939], [12940, 14139], [14140, 15409], [15410, 16749],
  [16750, 18169], [18170, 19669], [19670, 21249], [21250, 22909], [22910, 24649],
  [24650, 26479], [26480, 28399], [28400, 30409], [30410, 32509], [32510, 34699],
  [34700, 37009], [37010, 39449], [39450, 42029], [42030, 44749], [44750, 47619],
  [47620, 51119], [51120, 54849], [54850, 58819], [58820, 63039], [63040, 999999],
];

const LEVELS: Level[] = XP_RANGES.map(([minXP, maxXP], i) => {
  const stageIndex = Math.floor(i / 5);
  const subLevel = (i % 5) + 1;
  const s = STAGE_CONFIGS[stageIndex];
  const roman = ROMAN_NUMERALS[subLevel - 1];
  return {
    tier: i + 1,
    stage: stageIndex + 1,
    stageName: s.stageName,
    subLevel,
    title: `${s.stageName} · ${roman}`,
    fullTitle: `${s.stageName} · ${roman} — ${SUB_PERSONALITIES[subLevel - 1]}`,
    minXP,
    maxXP,
    color: s.color,
    description: s.description,
    scripture: s.scripture,
    isStageStart: subLevel === 1,
  };
});

export const MINOR_LEVEL_SCRIPTURES: { ref: string; text: string }[] = [
  { ref: "Galatians 6:9",         text: "Let us not grow weary of doing good." },
  { ref: "Hebrews 12:1",          text: "Run with endurance the race set before us." },
  { ref: "Philippians 1:6",       text: "He who began a good work in you will complete it." },
  { ref: "1 Corinthians 15:58",   text: "Your labor in the Lord is not in vain." },
  { ref: "James 1:12",            text: "Blessed is the one who perseveres." },
  { ref: "Psalm 84:7",            text: "They go from strength to strength." },
  { ref: "Proverbs 4:18",         text: "The path of the righteous is like the morning sun, shining ever brighter." },
  { ref: "2 Corinthians 4:16",    text: "Though our outer self is wasting away, our inner self is being renewed day by day." },
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

type XPAwardState = {
  pillarsAwarded: string[];
  faithfulBonus: boolean;
  flourishingBonus: boolean;
};

export function awardCheckInXP(summary: ScoreSummary): {
  newTotalXP: number;
  xpEarned: number;
  leveledUp: boolean;
  oldLevel: Level;
  newLevel: Level;
} {
  const today = new Date().toISOString().slice(0, 10);
  const stateKey = `optima_xp_awarded_${today}`;

  let state: XPAwardState = { pillarsAwarded: [], faithfulBonus: false, flourishingBonus: false };
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(stateKey);
      if (saved) state = JSON.parse(saved) as XPAwardState;
    } catch { /* ignore */ }
  }

  let xpToAward = 0;
  const newPillarsAwarded = [...state.pillarsAwarded];

  for (const cs of summary.categoryScores) {
    if (cs.presenceAchieved && !newPillarsAwarded.includes(cs.category)) {
      xpToAward += 10;
      newPillarsAwarded.push(cs.category);
    }
  }

  let newFaithfulBonus = state.faithfulBonus;
  let newFlourishingBonus = state.flourishingBonus;

  if (summary.pillarsPresent >= 4 && !newFaithfulBonus) {
    xpToAward += 25;
    newFaithfulBonus = true;
  }
  if (summary.pillarsPresent === 5 && !newFlourishingBonus) {
    xpToAward += 15;
    newFlourishingBonus = true;
  }

  if (xpToAward === 0) {
    const raw = loadGameStats();
    const lvl = getLevel(raw.totalXP);
    return { newTotalXP: raw.totalXP, xpEarned: 0, leveledUp: false, oldLevel: lvl, newLevel: lvl };
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(stateKey, JSON.stringify({
      pillarsAwarded: newPillarsAwarded,
      faithfulBonus: newFaithfulBonus,
      flourishingBonus: newFlourishingBonus,
    }));
  }

  const result = awardXP(xpToAward, "daily_checkin");
  return { ...result, xpEarned: xpToAward };
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
