import type { PinnedIntention, DailyIntentions } from "@/types/optima";
import { getTodayString } from "./dailyStorage";

const INTENTIONS_KEY = "optima_daily_intentions";

export const DEFAULT_REMINDER_TIMES = ["08:00", "12:00", "19:00"];

export function createEmptyIntentions(): DailyIntentions {
  return {
    date: getTodayString(),
    intentions: [],
    isPremium: false,
    maxIntentions: 3,
  };
}

export function loadIntentions(): DailyIntentions {
  try {
    const saved = localStorage.getItem(INTENTIONS_KEY);
    if (!saved) return createEmptyIntentions();
    const data = JSON.parse(saved) as DailyIntentions;
    if (data.date !== getTodayString()) return createEmptyIntentions();
    return data;
  } catch {
    return createEmptyIntentions();
  }
}

export function saveIntentions(data: DailyIntentions): void {
  try {
    localStorage.setItem(INTENTIONS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save intentions", e);
  }
}

export function addIntention(
  intention: PinnedIntention,
  current: DailyIntentions,
): DailyIntentions | null {
  if (current.intentions.length >= current.maxIntentions) return null;
  if (current.intentions.find((i) => i.habitId === intention.habitId)) return current;
  return { ...current, intentions: [...current.intentions, intention] };
}

export function removeIntention(habitId: string, current: DailyIntentions): DailyIntentions {
  return { ...current, intentions: current.intentions.filter((i) => i.habitId !== habitId) };
}

export function updateCustomTimeForAll(
  customTime: string,
  current: DailyIntentions,
): DailyIntentions {
  return {
    ...current,
    intentions: current.intentions.map((i) => ({
      ...i,
      customTime,
      reminderTimes: [DEFAULT_REMINDER_TIMES[0], DEFAULT_REMINDER_TIMES[1], customTime],
    })),
  };
}
