import { categories, habits } from "@/data/habits";
import type { Habit, Rating, RatingLabel, ScoreSummary } from "@/types/optima";

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

export function calculateScore(selectedHabitIds: string[], habitList: Habit[] = habits): number {
  const possiblePoints = habitList.reduce((sum, habit) => sum + habit.points, 0);

  if (possiblePoints === 0) {
    return 0;
  }

  const selectedPoints = habitList.reduce(
    (sum, habit) => sum + (selectedHabitIds.includes(habit.id) ? habit.points : 0),
    0,
  );

  return clampScore((selectedPoints / possiblePoints) * 100);
}

export function buildScoreSummary(
  selectedHabitIds: string[],
  habitList: Habit[] = habits,
): ScoreSummary {
  const score = calculateScore(selectedHabitIds, habitList);

  return {
    score,
    rating: getRating(score),
    selectedCount: selectedHabitIds.length,
    totalHabits: habitList.length,
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
