import type { DailyRecord } from "@/types/optima";

const TODAY_DATE_KEY = "optima_today_date";
const TODAY_HABITS_KEY = "optima_today_habits";
const HISTORY_KEY = "optima_history";

export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getDayLabel(dateStr: string): string {
  const today = getTodayString();
  const todayMs = new Date(today + "T12:00:00").getTime();
  const targetMs = new Date(dateStr + "T12:00:00").getTime();
  const diffDays = Math.round((todayMs - targetMs) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
  }
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getSavedDate(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TODAY_DATE_KEY);
}

export function hasPreviousDayToArchive(): boolean {
  if (typeof window === "undefined") return false;
  const savedDate = window.localStorage.getItem(TODAY_DATE_KEY);
  return savedDate !== null && savedDate !== getTodayString();
}

export function saveTodayHabits(habitIds: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TODAY_DATE_KEY, getTodayString());
  window.localStorage.setItem(TODAY_HABITS_KEY, JSON.stringify(habitIds));
}

export function loadTodayHabits(): string[] | null {
  if (typeof window === "undefined") return null;
  const savedDate = window.localStorage.getItem(TODAY_DATE_KEY);
  if (savedDate !== getTodayString()) return null;
  try {
    const raw = window.localStorage.getItem(TODAY_HABITS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as string[];
  } catch {
    return null;
  }
}

export function loadRawSavedHabits(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TODAY_HABITS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as string[];
  } catch {
    return null;
  }
}

export function loadHistory(): DailyRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DailyRecord[];
  } catch {
    return [];
  }
}

export function archiveDay(record: DailyRecord): void {
  if (typeof window === "undefined") return;
  const history = loadHistory();
  const idx = history.findIndex((r) => r.date === record.date);
  if (idx >= 0) {
    history[idx] = record;
  } else {
    history.unshift(record);
  }
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearTodayHabits(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TODAY_DATE_KEY);
  window.localStorage.removeItem(TODAY_HABITS_KEY);
}
