import { categories, habits } from "@/data/habits";
import type { Habit, Rating, RatingLabel, ScoreSummary } from "@/types/optima";

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

export function buildScoreSummary(
  selectedHabitIds: string[],
  habitList: Habit[] = habits,
): ScoreSummary {
  const score = calculateScore(selectedHabitIds, habitList);
  const selectedHabits = habitList.filter((habit) => selectedHabitIds.includes(habit.id));

  return {
    score,
    rating: getRating(score),
    selectedCount: selectedHabits.length,
    totalHabits: habitList.length,
    positiveActionsCount: selectedHabits.filter((habit) => habit.kind === "positive").length,
    drainsLoggedCount: selectedHabits.filter((habit) => habit.kind === "drain").length,
    categoryScores: categories.map((category) => {
      const categoryHabits = habitList.filter((habit) => habit.category === category);

      return {
        category,
        completed: categoryHabits.filter((habit) => selectedHabitIds.includes(habit.id)).length,
        total: categoryHabits.length,
      };
    }),
  };
}
