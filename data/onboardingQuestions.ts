import type { Category, OnboardingQuestion } from "@/types/optima";

export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: "motivation",
    eyebrow: "First, your why",
    question: "What brings you to Óptima?",
    companionMessage: "I’ll use this to keep your reflection focused, not heavy.",
    options: [
      "Build better discipline",
      "Reduce doomscrolling",
      "Improve physical health",
      "Grow spiritually",
      "Be more productive",
      "Feel more balanced",
    ],
  },
  {
    id: "improvementArea",
    eyebrow: "Your focus",
    question: "Which area do you want to improve most?",
    companionMessage: "No pressure to fix everything. One clear focus is enough to begin.",
    options: ["Spiritual", "Mental", "Physical", "Relational", "Productivity"],
  },
  {
    id: "dayDisruptor",
    eyebrow: "Common drain",
    question: "What usually throws off your day?",
    companionMessage: "Thanks for being honest. Naming the pattern gives you more choice around it.",
    options: [
      "Poor sleep",
      "Too much scrolling",
      "Lust / porn",
      "Junk food",
      "Stress",
      "Isolation",
      "Lack of planning",
    ],
  },
  {
    id: "optimalFeeling",
    eyebrow: "Your version of optimal",
    question: "What does an optimal day feel like to you?",
    companionMessage: "Optimal does not mean perfect. It means aligned enough to build from.",
    options: ["Peaceful", "Disciplined", "Productive", "Spiritually aligned", "Connected", "Balanced"],
  },
  {
    id: "communicationStyle",
    eyebrow: "Companion tone",
    question: "How should Óptima speak to you?",
    companionMessage: "I can be supportive in the style that helps you receive the truth.",
    options: ["Gentle", "Direct", "Coach-like", "Faith-centered", "Practical"],
  },
];

export const focusAreaDescriptions: Record<Category, string> = {
  Spiritual: "Create small moments for prayer, gratitude, or alignment before the day gets loud.",
  Mental: "Protect attention and give your mind a little more space to breathe.",
  Physical: "Support your body with rest, hydration, movement, and honest recovery.",
  Relational: "Stay connected without forcing yourself to perform for everyone.",
  Productivity: "Make tomorrow easier with simple planning and one clear priority.",
};
