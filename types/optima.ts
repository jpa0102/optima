export type RelationshipStatus =
  | "single"
  | "dating"
  | "engaged"
  | "married"
  | "widowed"
  | "prefer_not_to_say";

export type HasChildren = "yes" | "no";

export type WorkSituation =
  | "full_time_work"
  | "business_owner"
  | "part_time_work"
  | "student"
  | "stay_at_home_parent"
  | "retired"
  | "between_jobs"
  | "ministry_full_time";

export type AgeRange =
  | "under_18"
  | "18_24"
  | "25_34"
  | "35_44"
  | "45_54"
  | "55_64"
  | "65_plus";

export type FaithStage =
  | "exploring"
  | "new_believer"
  | "growing"
  | "established"
  | "leader_or_mature";

export type LifeSeason =
  | "thriving"
  | "busy_full"
  | "transitioning"
  | "quiet_steady"
  | "hard_season"
  | "grieving"
  | "rebuilding";

export type HealthConsideration =
  | "none"
  | "chronic_illness"
  | "physical_limitation"
  | "recovering_addiction"
  | "mental_health"
  | "pregnant_postpartum"
  | "prefer_not_to_say";

export type CurrentStruggle =
  | "lust_purity"
  | "pride_anger"
  | "anxiety_worry"
  | "comparison_envy"
  | "addiction_substances"
  | "social_media"
  | "isolation_loneliness"
  | "unforgiveness"
  | "discontentment"
  | "laziness_procrastination"
  | "financial_stress"
  | "doubt_unbelief";

export type UserProfile = {
  relationshipStatus: RelationshipStatus;
  hasChildren: HasChildren;
  workSituation: WorkSituation;
  ageRange: AgeRange;
  faithStage: FaithStage;
  lifeSeason: LifeSeason;
  healthConsideration: HealthConsideration;
  currentStruggles: CurrentStruggle[];
  customHabitIds: string[];
  hiddenHabitIds: string[];
  pinnedHabitIds: string[];
};

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

export type QuestCategory = Category;

export type QuestDifficulty = "gentle" | "moderate" | "challenging";

export type Quest = {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  scriptureRef: string;
  scriptureText: string;
  forStruggles?: CurrentStruggle[];
  forLifeSeasons?: LifeSeason[];
  forFaithStages?: FaithStage[];
  forWorkSituations?: WorkSituation[];
  forHealthConsiderations?: HealthConsideration[];
  steps?: string[];
  estimatedMinutes: number;
  pointsReward: number;
  startMessage: string;
  completionMessage: string;
  reminderMessage: string;
};

export type DailyQuest = {
  date: string;
  questId: string;
  startedAt?: string;
  completedAt?: string;
  status: "available" | "in_progress" | "completed" | "skipped";
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
  description: string;
  scripture: string;
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