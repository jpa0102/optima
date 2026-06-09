import type {
  CompanionMood,
  CurrentStruggle,
  Habit,
  UserProfile,
} from "@/types/optima";

const PROFILE_KEY = "optima_user_profile";

export function getDefaultProfile(): UserProfile {
  return {
    relationshipStatus: "prefer_not_to_say",
    hasChildren: "no",
    workSituation: "full_time_work",
    ageRange: "25_34",
    faithStage: "growing",
    lifeSeason: "busy_full",
    healthConsideration: "none",
    currentStruggles: [],
    customHabitIds: [],
    hiddenHabitIds: [],
    pinnedHabitIds: [],
  };
}

export function loadUserProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (!saved) return getDefaultProfile();
    return { ...getDefaultProfile(), ...JSON.parse(saved) };
  } catch {
    return getDefaultProfile();
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
}

const STRUGGLE_MAP: Record<CurrentStruggle, string[]> = {
  lust_purity: ["pornography", "lust-fantasizing"],
  pride_anger: ["pride-arrogance"],
  anxiety_worry: ["worry-as-lifestyle"],
  comparison_envy: ["comparison"],
  addiction_substances: ["drunkenness", "illegal-drugs", "vaping-nicotine"],
  social_media: ["doomscrolling", "excessive-social-media", "binge-watching"],
  isolation_loneliness: ["isolating-from-community"],
  unforgiveness: ["bitterness-unforgiveness", "holding-grudges"],
  discontentment: ["love-of-money"],
  laziness_procrastination: ["procrastination"],
  financial_stress: ["love-of-money"],
  doubt_unbelief: ["neglecting-prayer", "neglecting-scripture", "hypocrisy"],
};

const DEFAULT_DRAIN_IDS = [
  "doomscrolling",
  "comparison",
  "procrastination",
  "pride-arrogance",
  "neglecting-prayer",
];

const WORK_HABIT_IDS = [
  "focused-work-block",
  "phone-away-deep-work",
  "identify-top-priority",
];

const INTENSE_EXERCISE_IDS = ["strength-training", "cardio-150"];

export function getPersonalizedHabits(
  allHabits: Habit[],
  profile: UserProfile,
): Habit[] {
  return allHabits.filter((habit) => {
    if (profile.hiddenHabitIds.includes(habit.id)) return false;
    if (profile.customHabitIds.includes(habit.id)) return true;

    // Relationship-based
    if (
      habit.id === "date-night" &&
      profile.relationshipStatus !== "married" &&
      profile.relationshipStatus !== "engaged"
    ) {
      return false;
    }

    // Children-based
    if (habit.id === "one-on-one-child" && profile.hasChildren === "no") {
      return false;
    }

    // Work-based
    if (
      WORK_HABIT_IDS.includes(habit.id) &&
      profile.workSituation === "retired"
    ) {
      return false;
    }

    // Health-based
    if (
      INTENSE_EXERCISE_IDS.includes(habit.id) &&
      profile.healthConsideration === "physical_limitation"
    ) {
      return false;
    }

    // Struggle-based drain filtering
    if (habit.kind === "drain") {
      if (profile.currentStruggles.length === 0) {
        return DEFAULT_DRAIN_IDS.includes(habit.id);
      }
      const relevantIds = new Set(
        profile.currentStruggles.flatMap((s) => STRUGGLE_MAP[s] ?? []),
      );
      return relevantIds.has(habit.id);
    }

    return true;
  });
}

export function getAdaptiveLabel(habit: Habit, profile: UserProfile): string {
  if (habit.id === "family-presence" && profile.hasChildren === "no") {
    return "Was present with people I love";
  }
  return habit.label;
}

export function getAdaptiveCompanionMessage(
  mood: CompanionMood,
  profile: UserProfile,
): string {
  const { lifeSeason, faithStage } = profile;

  if (lifeSeason === "hard_season" || lifeSeason === "grieving") {
    if (mood === "Flourishing")
      return "Even in this hard season, you're showing up. He sees that.";
    if (mood === "Faithful")
      return "Faithful in suffering. There is no greater witness.";
    if (mood === "Pressing On")
      return "You're carrying so much. The Lord is your shepherd.";
    return "Rest in Him. He is enough for today.";
  }

  if (faithStage === "new_believer" || faithStage === "exploring") {
    if (mood === "Flourishing") return "Look at you showing up. Every step matters.";
    if (mood === "Faithful") return "Steady steps forward. God honors every one.";
    if (mood === "Pressing On")
      return "It's okay to be a beginner. He meets you right here.";
    return "Rest. You don't have to perform for God — just come to Him.";
  }

  if (faithStage === "leader_or_mature") {
    if (mood === "Flourishing")
      return "Bearing much fruit. Abide — not in your effort, but in Him.";
    if (mood === "Faithful")
      return "The ordinary, obedient day. God honors the hidden faithfulness of mature saints.";
    if (mood === "Pressing On")
      return "The righteous fall seven times and rise. You know this. Rise again.";
    return "Even mature saints need stillness. Be still and know.";
  }

  if (mood === "Flourishing")
    return "Walking in step with the Spirit today. Abide in this.";
  if (mood === "Faithful")
    return "Steady and present. God sees your faithfulness.";
  if (mood === "Pressing On")
    return "He who began a good work in you will complete it. Keep going.";
  return "Be still and know that I am God. Rest in His grace today.";
}

// Human-readable labels for profile values
export const PROFILE_LABELS = {
  relationshipStatus: {
    single: "Single",
    dating: "Dating",
    engaged: "Engaged",
    married: "Married",
    widowed: "Widowed",
    prefer_not_to_say: "Prefer not to say",
  },
  hasChildren: { yes: "Yes", no: "No" },
  workSituation: {
    full_time_work: "Full-time work",
    business_owner: "Business owner",
    part_time_work: "Part-time work",
    student: "Student",
    stay_at_home_parent: "Stay-at-home parent",
    retired: "Retired",
    between_jobs: "Between jobs",
    ministry_full_time: "Full-time ministry",
  },
  ageRange: {
    under_18: "Under 18",
    "18_24": "18–24",
    "25_34": "25–34",
    "35_44": "35–44",
    "45_54": "45–54",
    "55_64": "55–64",
    "65_plus": "65 or older",
  },
  faithStage: {
    exploring: "Exploring",
    new_believer: "New believer",
    growing: "Growing",
    established: "Established",
    leader_or_mature: "Leading / mature",
  },
  lifeSeason: {
    thriving: "Thriving",
    busy_full: "Busy and full",
    transitioning: "Transitioning",
    quiet_steady: "Quiet and steady",
    hard_season: "Hard season",
    grieving: "Grieving",
    rebuilding: "Rebuilding",
  },
  healthConsideration: {
    none: "Nothing specific",
    chronic_illness: "Chronic illness",
    physical_limitation: "Physical limitation",
    recovering_addiction: "Recovering from addiction",
    mental_health: "Mental health considerations",
    pregnant_postpartum: "Pregnant or postpartum",
    prefer_not_to_say: "Prefer not to say",
  },
} as const;

export const STRUGGLE_LABELS: Record<CurrentStruggle, string> = {
  lust_purity: "Lust / purity",
  pride_anger: "Pride / anger",
  anxiety_worry: "Anxiety / worry",
  comparison_envy: "Comparison / envy",
  addiction_substances: "Addiction / substances",
  social_media: "Social media / screen time",
  isolation_loneliness: "Isolation / loneliness",
  unforgiveness: "Unforgiveness",
  discontentment: "Discontentment / greed",
  laziness_procrastination: "Laziness / procrastination",
  financial_stress: "Financial stress",
  doubt_unbelief: "Doubt / unbelief",
};
