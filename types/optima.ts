export type Category =
  | "Spiritual"
  | "Mental"
  | "Physical"
  | "Relational"
  | "Productivity";

export type HabitKind = "positive" | "drain";

export type RatingLabel = "Optimal" | "Sub Optimal" | "Not Optimal";

export type CompanionMood = "bright" | "steady" | "tender";

export type OnboardingQuestionId =
  | "motivation"
  | "improvementArea"
  | "dayDisruptor"
  | "optimalFeeling"
  | "communicationStyle";

export type OnboardingAnswers = Partial<Record<OnboardingQuestionId, string>>;

export type OnboardingQuestion = {
  id: OnboardingQuestionId;
  eyebrow: string;
  question: string;
  companionMessage: string;
  options: string[];
};

export type Habit = {
  id: string;
  label: string;
  category: Category;
  kind: HabitKind;
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
  completionRate: number;
};

export type ScoreSummary = {
  score: number;
  rating: Rating;
  selectedCount: number;
  totalHabits: number;
  positiveActionsCount: number;
  drainsLoggedCount: number;
  strongestArea: Category;
  growthArea: Category;
  companionMessage: string;
  dailyTakeaway: string;
  categoryScores: CategoryScore[];
};

export type SavedDay = {
  id: string;
  dateLabel: string;
  score: number;
  rating: RatingLabel;
  selectedHabitIds: string[];
  positiveActionsCount?: number;
  drainsLoggedCount?: number;
  reflection: string;
};

export type AppTab = "home" | "check-in" | "history";