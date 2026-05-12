import { categories, habits } from "@/data/habits";
import type { Category, CategoryScore, Habit, Rating, RatingLabel, ScoreSummary } from "@/types/optima";

export const BASELINE_SCORE = 72;

const clampScore = (score: number) => Math.min(100, Math.max(0, Math.round(score)));

export function getRating(score: number): Rating {
  const normalizedScore = clampScore(score);

  if (normalizedScore >= 85) {
    return {
      label: "Optimal",
      tone: "A clear, grounded day. Let it encourage you without needing to chase it.",
      companionMood: "bright",
    };
  }

  if (normalizedScore >= 60) {
    return {
      label: "Sub Optimal",
      tone: "A mixed but meaningful day. Notice what helped and reset gently.",
      companionMood: "steady",
    };
  }

  return {
    label: "Not Optimal",
    tone: "A tender day deserves honesty and care. Tomorrow can be simpler.",
    companionMood: "tender",
  };
}

export function getRatingLabel(score: number): RatingLabel {
  return getRating(score).label;
}

export function calculateScore(selectedHabitIds: string[], habitList: Habit[] = habits): number {
  const selectedDelta = habitList.reduce(
    (sum, habit) => sum + (selectedHabitIds.includes(habit.id) ? habit.points : 0),
    0,
  );

  return clampScore(BASELINE_SCORE + selectedDelta);
}

function getCategoryScores(selectedHabitIds: string[], habitList: Habit[]): CategoryScore[] {
  return categories.map((category) => {
    const categoryHabits = habitList.filter((habit) => habit.category === category);
    const completed = categoryHabits.filter((habit) => selectedHabitIds.includes(habit.id)).length;
    const total = categoryHabits.length;

    return {
      category,
      completed,
      total,
      completionRate: total > 0 ? completed / total : 0,
    };
  });
}

function getAreaByRate(categoryScores: CategoryScore[], direction: "strongest" | "growth"): Category {
  return categoryScores.reduce((selected, current) => {
    if (direction === "strongest") {
      return current.completionRate > selected.completionRate ? current : selected;
    }

    return current.completionRate < selected.completionRate ? current : selected;
  }, categoryScores[0]).category;
}

function getCompanionMessage(score: number, positiveActionsCount: number, drainsLoggedCount: number): string {
  if (score >= 85) {
    return positiveActionsCount >= 10
      ? "I’m glowing with you. Your future self benefits from this kind of care."
      : "This is a day you can build from — steady, bright, and honest.";
  }

  if (score >= 60) {
    return drainsLoggedCount > 0
      ? "Thanks for being honest. Mixed signals still give us a clear next step."
      : "Calm progress counts. Let’s keep listening to what helped today.";
  }

  return drainsLoggedCount > 2
    ? "Let’s reset with clarity. I’m here with you, not against you."
    : "A recovering day can still be a wise day. Small care is enough to begin.";
}

function getDailyTakeaway(score: number, strongestArea: Category, growthArea: Category): string {
  if (score >= 85) {
    return `${strongestArea} carried real momentum today. Protect that rhythm and keep ${growthArea} simple tomorrow.`;
  }

  if (score >= 60) {
    return `Thanks for being honest. ${strongestArea} gave you something to build from, and ${growthArea} is the gentlest next area to support.`;
  }

  return `This check-in is not a verdict. Start with one small ${growthArea} action and let ${strongestArea} remind you that care is still present.`;
}

export function buildScoreSummary(
  selectedHabitIds: string[],
  habitList: Habit[] = habits,
): ScoreSummary {
  const score = calculateScore(selectedHabitIds, habitList);
  const selectedHabits = habitList.filter((habit) => selectedHabitIds.includes(habit.id));
  const positiveActionsCount = selectedHabits.filter((habit) => habit.kind === "positive").length;
  const drainsLoggedCount = selectedHabits.filter((habit) => habit.kind === "drain").length;
  const categoryScores = getCategoryScores(selectedHabitIds, habitList);
  const strongestArea = getAreaByRate(categoryScores, "strongest");
  const growthArea = getAreaByRate(categoryScores, "growth");

  return {
    score,
    rating: getRating(score),
    selectedCount: selectedHabits.length,
    totalHabits: habitList.length,
    positiveActionsCount,
    drainsLoggedCount,
    strongestArea,
    growthArea,
    companionMessage: getCompanionMessage(score, positiveActionsCount, drainsLoggedCount),
    dailyTakeaway: getDailyTakeaway(score, strongestArea, growthArea),
    categoryScores,
  };
}
