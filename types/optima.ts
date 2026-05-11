export type Category =
  | "Spiritual"
  | "Mental"
  | "Physical"
  | "Relational"
  | "Productivity";

export type RatingLabel = "Optimal" | "Sub Optimal" | "Not Optimal";

export type CompanionMood = "bright" | "steady" | "tender";

export type Habit = {
  id: string;
  label: string;
  category: Category;
  points: number;
  description: string;
};

export type Rating = {
  label: RatingLabel;
  tone: string;
  companionMood: CompanionMood;
};

export type CategoryScore = {
  category: Category;
  completed: number;
  total: number;
};

export type ScoreSummary = {
  score: number;
  rating: Rating;
  selectedCount: number;
  totalHabits: number;
  categoryScores: CategoryScore[];
};

export type SavedDay = {
  id: string;
  dateLabel: string;
  score: number;
  rating: RatingLabel;
  selectedHabitIds: string[];
  reflection: string;
};
