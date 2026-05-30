import type { PinnedIntention } from "@/types/optima";
import { getIntentionMessage } from "./intentionMessages";
import { canNotify } from "./notifications";

const SCHEDULED_KEY = "optima_scheduled_reminders";

export function scheduleIntentionReminders(intentions: PinnedIntention[]): void {
  if (typeof window === "undefined") return;
  if (!canNotify()) return;

  clearScheduledReminders();

  const timeoutIds: number[] = [];
  const now = new Date();

  intentions.forEach((intention) => {
    const times = intention.customTime
      ? [intention.reminderTimes[0] ?? "08:00", intention.reminderTimes[1] ?? "12:00", intention.customTime]
      : intention.reminderTimes;

    times.forEach((timeStr) => {
      if (!timeStr) return;
      const [hours, minutes] = timeStr.split(":").map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      if (target <= now) return;

      const delay = target.getTime() - now.getTime();
      const timeoutId = window.setTimeout(() => {
        fireIntentionNotification(intention, timeStr);
      }, delay);
      timeoutIds.push(timeoutId);
    });
  });

  sessionStorage.setItem(SCHEDULED_KEY, JSON.stringify(timeoutIds));
}

function fireIntentionNotification(intention: PinnedIntention, timeStr: string): void {
  if (!canNotify()) return;
  const message = getIntentionMessage(intention, timeStr);
  const isDrain = intention.habitKind === "drain";
  const title = isDrain ? `Óptima · Freedom reminder 🕊️` : `Óptima · ${intention.habitLabel} ✦`;
  new Notification(title, {
    body: message,
    icon: "/icon-192.png",
    tag: `optima-intention-${intention.habitId}`,
    requireInteraction: false,
  });
}

export function clearScheduledReminders(): void {
  if (typeof window === "undefined") return;
  try {
    const saved = sessionStorage.getItem(SCHEDULED_KEY);
    if (saved) {
      const ids = JSON.parse(saved) as number[];
      ids.forEach((id) => window.clearTimeout(id));
    }
    sessionStorage.removeItem(SCHEDULED_KEY);
  } catch {
    // silent fail
  }
}
