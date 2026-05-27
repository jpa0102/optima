import { categories, habits } from "@/data/habits";
import type {
  Category,
  CategoryScore,
  Habit,
  Rating,
  RatingLabel,
  ScoreSummary,
} from "@/types/optima";

const VOLUME_CAP = 5;
const HEART_HABIT_IDS = ["morning-prayer", "evening-examen"];

const clampScore = (score: number) =>
  Math.min(100, Math.max(0, Math.round(score)));

export function getRating(score: number): Rating {
  const normalizedScore = clampScore(score);

  if (normalizedScore >= 85) {
    return {
      label: "Optimal",
      tone: "A day of faithful stewardship. Give the glory back to Him.",
      companionMood: "Flourishing",
    };
  }

  if (normalizedScore >= 65) {
    return {
      label: "Sub Optimal",
      tone: "More right than wrong today. Reset gently and press on in grace.",
      companionMood: "Faithful",
    };
  }

  if (normalizedScore >= 40) {
    return {
      label: "Not Optimal",
      tone: "His grace is sufficient. Tomorrow's mercies are already waiting.",
      companionMood: "Pressing On",
    };
  }

  return {
    label: "Not Optimal",
    tone: "His grace is sufficient. Tomorrow's mercies are already waiting.",
    companionMood: "Be Still",
  };
}

export function getRatingLabel(score: number): RatingLabel {
  return getRating(score).label;
}

type PillarResult = {
  pillarScore: number;
  presenceAchieved: boolean;
};

function scorePillar(
  category: Category,
  selectedHabitIds: string[],
  habitList: Habit[],
): PillarResult {
  const pillarHabits = habitList.filter((h) => h.category === category);
  const selectedPositive = pillarHabits.filter(
    (h) => h.kind === "positive" && selectedHabitIds.includes(h.id),
  );
  const selectedDrains = pillarHabits.filter(
    (h) => h.kind === "drain" && selectedHabitIds.includes(h.id),
  );

  const presenceAchieved = selectedPositive.length >= 1;

  if (!presenceAchieved) {
    return { pillarScore: 0, presenceAchieved: false };
  }

  const extraPositive = Math.min(selectedPositive.length - 1, VOLUME_CAP);
  const volumeBonus = (extraPositive / VOLUME_CAP) * 50;

  let heartBonus = 0;
  if (category === "Spiritual") {
    const heartCount = HEART_HABIT_IDS.filter((id) =>
      selectedHabitIds.includes(id),
    ).length;
    heartBonus = heartCount === 2 ? 15 : heartCount === 1 ? 8 : 0;
  }

  const drainPenalty = Math.min(
    selectedDrains.reduce((sum, h) => sum + Math.abs(h.points), 0),
    40,
  );

  const pillarScore = clampScore(40 + volumeBonus + heartBonus - drainPenalty);

  return { pillarScore, presenceAchieved: true };
}

export function calculateScore(
  selectedHabitIds: string[],
  habitList: Habit[] = habits,
): number {
  const pillarResults = categories.map((category) =>
    scorePillar(category, selectedHabitIds, habitList),
  );

  const pillarsPresent = pillarResults.filter((r) => r.presenceAchieved).length;
  const pillarSum = pillarResults.reduce((sum, r) => sum + r.pillarScore, 0);

  const breadthBonus =
    pillarsPresent === 5 ? 25 : (pillarsPresent / 5) * 20;

  return clampScore(pillarSum / 5 + breadthBonus);
}

function buildCategoryScores(
  selectedHabitIds: string[],
  habitList: Habit[] = habits,
): CategoryScore[] {
  return categories.map((category) => {
    const pillarHabits = habitList.filter((h) => h.category === category);
    const completed = pillarHabits.filter((h) =>
      selectedHabitIds.includes(h.id),
    ).length;
    const total = pillarHabits.length;

    const { pillarScore, presenceAchieved } = scorePillar(
      category,
      selectedHabitIds,
      habitList,
    );

    return {
      category,
      completed,
      total,
      completionRate: pillarScore,
      presenceAchieved,
    };
  });
}

function getStrongestArea(categoryScores: CategoryScore[]): Category {
  const present = categoryScores.filter((s) => s.presenceAchieved);
  const pool = present.length > 0 ? present : categoryScores;
  return [...pool].sort((a, b) => b.completionRate - a.completionRate)[0]
    ?.category ?? "Mental";
}

function getGrowthArea(categoryScores: CategoryScore[]): Category {
  return [...categoryScores].sort(
    (a, b) => a.completionRate - b.completionRate,
  )[0]?.category ?? "Mental";
}

export function getCompanionMessage(score: number): string {
  if (score >= 85) {
    return "You are bearing much fruit today. Let gratitude be your response, not pride.";
  }

  if (score >= 65) {
    return "You are showing up faithfully. God honors the ordinary, obedient day.";
  }

  if (score >= 40) {
    return "Even here, He is with you. The righteous fall seven times and rise again.";
  }

  return "Come to Him as you are. His mercies are new every morning — this is not your final word.";
}

export function getDailyTakeaway(score: number): string {
  if (score >= 85) {
    return "Your habits supported the kind of day you want to live.";
  }

  if (score >= 65) {
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

  const selectedHabits = habitList.filter((h) =>
    selectedHabitIds.includes(h.id),
  );

  const positiveActionsCount = selectedHabits.filter(
    (h) => h.kind === "positive",
  ).length;

  const drainsLoggedCount = selectedHabits.filter(
    (h) => h.kind === "drain",
  ).length;

  const pillarsPresent = categoryScores.filter((s) => s.presenceAchieved).length;

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
    pillarsPresent,
    isFaithfulDay: pillarsPresent >= 4,
  };
}
