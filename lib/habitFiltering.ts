import type { Habit } from "@/types/optima";

const SUNDAY_ONLY_IDS = ["corporate-worship", "weekly-review-plan", "tithe"];
const SABBATH_ONLY_IDS = ["sabbath-observance", "honor-sabbath-no-work", "digital-sabbath"];
const WEEKEND_IDS = ["date-night"];

export function getHabitsForToday(
  allHabits: Habit[],
  date: Date = new Date(),
  sabbathDay = 0,
): Habit[] {
  const dayOfWeek = date.getDay();
  const isSunday = dayOfWeek === 0;
  const isFriday = dayOfWeek === 5;
  const isSaturday = dayOfWeek === 6;
  const isSabbath = dayOfWeek === sabbathDay;

  return allHabits.filter((habit) => {
    if (habit.rhythm === "daily") return true;
    if (habit.kind === "drain") return true;

    if (habit.rhythm === "weekly") {
      if (SUNDAY_ONLY_IDS.includes(habit.id)) return isSunday;
      if (SABBATH_ONLY_IDS.includes(habit.id)) return isSabbath;
      if (WEEKEND_IDS.includes(habit.id)) return isFriday || isSaturday;
      return true;
    }

    if (habit.rhythm === "periodic") return false;

    return true;
  });
}

export function getHabitsForCategory(
  allHabits: Habit[],
  category: string,
  date: Date = new Date(),
  sabbathDay = 0,
): Habit[] {
  return getHabitsForToday(allHabits, date, sabbathDay).filter(
    (h) => h.category === category,
  );
}
