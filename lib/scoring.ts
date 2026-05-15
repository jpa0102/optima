import { categories, habits } from "@/data/habits";
import type {
  Category,
  CategoryScore,
  Habit,
  Rating,
  RatingLabel,
  ScoreSummary,
} from "@/types/optima";

const clampScore = (score: number) =>
  Math.min(100, Math.max(0, Math.round(score)));

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
      tone: "A mixed but meaningful day. Notice what worked and reset gently.",
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

export function calculateScore(
  selectedHabitIds: string[],
  habitList: Habit[] = habits,
): number {
  const positiveHabits = habitList.filter((habit) => habit.kind === "positive");
  const drainHabits = habitList.filter((habit) => habit.kind === "drain");

  const possiblePositivePoints = positiveHabits.reduce(
    (sum, habit) => sum + Math.max(0, habit.points),
    0,
  );

  const selectedPositivePoints = positiveHabits.reduce(
    (sum, habit) =>
      sum + (selectedHabitIds.includes(habit.id) ? Math.max(0, habit.points) : 0),
    0,
  );

  const selectedDrainPoints = drainHabits.reduce(
    (sum, habit) =>
      sum + (selectedHabitIds.includes(habit.id) ? Math.abs(habit.points) : 0),
    0,
  );

  if (possiblePositivePoints === 0) {
    return 0;
  }

  const baseScore = (selectedPositivePoints / possiblePositivePoints) * 100;
  const finalScore = baseScore - selectedDrainPoints;

  return clampScore(finalScore);
}

function buildCategoryScores(
  selectedHabitIds: string[],
  habitList: Habit[] = habits,
): CategoryScore[] {
  return categories.map((category) => {
    const categoryHabits = habitList.filter((habit) => habit.category === category);

    const completed = categoryHabits.filter((habit) =>
      selectedHabitIds.includes(habit.id),
    ).length;

    const total = categoryHabits.length;

    return {
      category,
      completed,
      total,
      completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  });
}

function getStrongestArea(categoryScores: CategoryScore[]): Category {
  const sorted = [...categoryScores].sort(
    (a, b) => b.completionRate - a.completionRate,
  );

  return sorted[0]?.category ?? "Mental";
}

function getGrowthArea(categoryScores: CategoryScore[]): Category {
  const sorted = [...categoryScores].sort(
    (a, b) => a.completionRate - b.completionRate,
  );

  return sorted[0]?.category ?? "Mental";
}

function getCompanionMessage(score: number): string {
  if (score >= 85) {
    return "You showed strong alignment today. Let this encourage you, not pressure you.";
  }

  if (score >= 60) {
    return "There was real momentum here. A few areas need care, but this is a day you can build from.";
  }

  return "Today may have felt heavy, but honest tracking is still a win. Let’s reset with clarity.";
}

function getDailyTakeaway(score: number): string {
  if (score >= 85) {
    return "Your habits supported the kind of day you want to live.";
  }

  if (score >= 60) {
    return "Your day had a foundation. The next step is protecting the areas that slipped.";
  }

  return "This was not a failure. It was information. Tomorrow can be simpler and more intentional.";
}

export function buildScoreSummary(
  selectedHabitIds: string[],
  habitList: Habit[] = habits,
): ScoreSummary {
  const score = calculateScore(selectedHabitIds, habitList);
  const categoryScores = buildCategoryScores(selectedHabitIds, habitList);

  const selectedHabits = habitList.filter((habit) =>
    selectedHabitIds.includes(habit.id),
  );

  const positiveActionsCount = selectedHabits.filter(
    (habit) => habit.kind === "positive",
  ).length;

  const drainsLoggedCount = selectedHabits.filter(
    (habit) => habit.kind === "drain",
  ).length;

  return {
    score,
    rating: getRating(score),
    selectedCount: selectedHabitIds.length,
    totalHabits: habitList.length,
    positiveActionsCount,
    drainsLoggedCount,
    strongestArea: getStrongestArea(categoryScores),
    growthArea: getGrowthArea(categoryScores),
    companionMessage: getCompanionMessage(score),
    dailyTakeaway: getDailyTakeaway(score),
    categoryScores,
  };
}
