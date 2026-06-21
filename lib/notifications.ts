import type { CategoryTip } from "@/data/categoryTips";
import type { DailyQuest, Quest } from "@/types/optima";
import { loadDailyQuest } from "./questSelector";
import { loadTodayHabits } from "./dailyStorage";

export const NOTIF_PERMISSION_KEY = "optima_notif_permission_asked";
export const NOTIF_REMINDER_TIME_KEY = "optima_reminder_time";

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function canNotify(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}

export function scheduleReminderNotification(
  weakestCategory: string,
  tip: CategoryTip,
  reminderTimeStr = "19:00",
  streak = 0,
): void {
  if (!canNotify()) return;

  const [hours, minutes] = reminderTimeStr.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  if (target <= now) return;

  const delay = target.getTime() - now.getTime();

  const existingId = sessionStorage.getItem("optima_reminder_timeout");
  if (existingId) clearTimeout(Number(existingId));

  const streakText = streak > 0 ? `Your ${streak}-day walk with God continues tomorrow.` : "Your walk with God continues tomorrow.";

  const timeoutId = setTimeout(() => {
    new Notification("Óptima ✦", {
      body: `${streakText} Come back and steward another day well. ✦`,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "optima-daily-reminder",
    });
  }, delay);

  sessionStorage.setItem("optima_reminder_timeout", String(timeoutId));
}

export function scheduleQuestReminders(quest: Quest, dailyQuest: DailyQuest): void {
  if (!canNotify()) return;
  if (dailyQuest.status === "completed") return;

  const times = ["10:00", "14:00", "18:00"];
  const now = new Date();

  times.forEach((timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) return;

    const delay = target.getTime() - now.getTime();
    setTimeout(() => {
      const latest = loadDailyQuest();
      if (latest?.status === "completed") return;
      new Notification("Óptima · Today's quest ✦", {
        body: quest.reminderMessage,
        icon: "/icon-192.png",
        tag: "optima-quest-reminder",
      });
    }, delay);
  });
}

function getScheduledIds(): number[] {
  try {
    const saved = sessionStorage.getItem("optima_daily_reminder_ids");
    return saved ? (JSON.parse(saved) as number[]) : [];
  } catch {
    return [];
  }
}

function saveScheduledIds(ids: number[]): void {
  sessionStorage.setItem("optima_daily_reminder_ids", JSON.stringify(ids));
}

export function clearScheduledDailyReminders(): void {
  const ids = getScheduledIds();
  ids.forEach((id) => window.clearTimeout(id));
  sessionStorage.removeItem("optima_daily_reminder_ids");
}

function scheduleAt(timeStr: string, callback: () => void): void {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  const now = new Date();
  if (target <= now) return;
  const delay = target.getTime() - now.getTime();
  const id = window.setTimeout(callback, delay);
  const ids = getScheduledIds();
  ids.push(id);
  saveScheduledIds(ids);
}

export function scheduleDailyReminders(
  quest: Quest | null,
  questStatus: string,
  habitsLoggedCount: number,
  isFaithfulDay: boolean,
): void {
  if (!canNotify()) return;
  clearScheduledDailyReminders();

  const todayKey = `optima_faithful_celebrated_${new Date().toISOString().slice(0, 10)}`;

  // 9 AM — Quest reminder
  if (quest && questStatus !== "completed" && questStatus !== "skipped") {
    scheduleAt("09:00", () => {
      const latest = loadDailyQuest();
      if (latest?.status === "completed") return;
      new Notification("Óptima · Your quest awaits ✦", {
        body: quest.reminderMessage,
        icon: "/icon-192.png",
        tag: "optima-quest-morning",
      });
    });
  }

  // 1 PM — Midday nudge
  if (habitsLoggedCount === 0) {
    scheduleAt("13:00", () => {
      const saved = loadTodayHabits();
      if (saved && saved.length > 0) return;
      new Notification("Óptima · How’s your day?", {
        body: "Take 60 seconds. Check in with Opti.",
        icon: "/icon-192.png",
        tag: "optima-midday",
      });
    });
  }

  // 7 PM — Evening reminder
  if (!isFaithfulDay) {
    scheduleAt("19:00", () => {
      if (localStorage.getItem(todayKey) === "true") return;
      new Notification("Óptima · Evening reflection", {
        body: "Before the day closes, take a few minutes with Opti.",
        icon: "/icon-192.png",
        tag: "optima-evening",
      });
    });

    // 9:30 PM — Last call
    scheduleAt("21:30", () => {
      if (localStorage.getItem(todayKey) === "true") return;
      new Notification("Óptima · One last check-in?", {
        body: "Even 2 minutes of honest reflection counts. He sees every effort.",
        icon: "/icon-192.png",
        tag: "optima-lastcall",
      });
    });
  }
}

export function sendImmediateNudge(category: string, tip: CategoryTip): void {
  if (!canNotify()) return;
  new Notification(`Óptima · ${category} needs you 💡`, {
    body: tip.quickWin,
    icon: "/icon-192.png",
    tag: "optima-nudge",
  });
}
