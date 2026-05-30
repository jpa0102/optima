export type Category =
  | "Spiritual"
  | "Mental"
  | "Physical"
  | "Relational"
  | "Stewardship";

export type HabitKind = "positive" | "drain";

export type RatingLabel = "Optimal" | "Sub Optimal" | "Not Optimal";

export type CompanionMood = "Flourishing" | "Faithful" | "Pressing On" | "Be Still";

export type OnboardingQuestionId =
  | "motivation"
  | "improvementArea"
  | "dayDisruptor"
  | "optimalFeeling"
  | "communicationStyle";

export type OnboardingAnswers = Partial<Record<OnboardingQuestionId, string | string[]>>;

export type OnboardingQuestion = {
  id: OnboardingQuestionId;
  eyebrow: string;
  question: string;
  companionMessage: string;
  options: string[];
  multiSelect?: boolean;
};

export type Habit = {
  id: string;
  label: string;
  category: Category;
  kind: HabitKind;
  points: number;
  description?: string;
  insight?: string;
  scriptureRef?: string;
  rhythm?: "daily" | "weekly" | "periodic";
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
  presenceAchieved: boolean;
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
  pillarsPresent: number;
  isFaithfulDay: boolean;
};

export type DailyRecord = {
  date: string;
  dateLabel: string;
  score: number;
  companionMood: CompanionMood;
  ratingLabel: RatingLabel;
  selectedHabitIds: string[];
  categoryScores: CategoryScore[];
  pillarsPresent: number;
  isFaithfulDay: boolean;
  topPillar?: Category;
  weakestPillar?: Category;
};

export type PinnedIntention = {
  habitId: string;
  habitLabel: string;
  habitKind: "positive" | "drain";
  category: Category;
  pinnedAt: string;
  reminderTimes: string[];
  customTime?: string;
};

export type DailyIntentions = {
  date: string;
  intentions: PinnedIntention[];
  isPremium: boolean;
  maxIntentions: number;
};

export type AppTab = "home" | "check-in" | "history";

export type Level = {
  tier: number;
  title: string;
  minXP: number;
  maxXP: number;
  color: string;
};

export type GameStats = {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckinDate: string;
  level: Level;
  xpToNextLevel: number;
  xpProgressPercent: number;
};