export type SabbathInvitation = {
  icon: string;
  category: string;
  title: string;
  description: string;
};

export const sabbathInvitations: SabbathInvitation[] = [
  // Worship
  {
    icon: "🙏",
    category: "Worship",
    title: "Gather with your church",
    description: "Be with the body of Christ. Hebrews 10:25.",
  },
  {
    icon: "🎵",
    category: "Worship",
    title: "Sing or listen to worship",
    description: "Let praise be the soundtrack of your day.",
  },
  {
    icon: "📖",
    category: "Worship",
    title: "Read Scripture slowly",
    description: "No goal, no plan — just sit with the Word.",
  },

  // Rest
  {
    icon: "💤",
    category: "Rest",
    title: "Take a nap without guilt",
    description: "Rest is an act of trust. God grants sleep to those He loves.",
  },
  {
    icon: "✋",
    category: "Rest",
    title: "Stop all work",
    description: "Even the kind that feels productive. Today is not for striving.",
  },
  {
    icon: "📵",
    category: "Rest",
    title: "Put the phone away",
    description: "Yes — including this app. We'll be here tomorrow.",
  },

  // Relationships
  {
    icon: "🍽️",
    category: "Relationships",
    title: "Share a long meal",
    description: "No rushing. Eat together. Linger at the table.",
  },
  {
    icon: "💬",
    category: "Relationships",
    title: "Have a conversation without an agenda",
    description: "Just be with someone — fully present, no purpose.",
  },
  {
    icon: "🤗",
    category: "Relationships",
    title: "Be physically present with someone you love",
    description: "A walk, a hug, sitting together. Presence is the gift.",
  },

  // Wonder
  {
    icon: "🌳",
    category: "Wonder",
    title: "Walk outside and notice creation",
    description: "The heavens declare His glory. — Psalm 19:1",
  },
  {
    icon: "📚",
    category: "Wonder",
    title: "Read something beautiful",
    description: "Poetry, a novel, the Psalms. Words that feed you.",
  },
  {
    icon: "☕",
    category: "Wonder",
    title: "Sit somewhere with no plan",
    description: "A porch, a window, a quiet room. Just be.",
  },

  // Reflection
  {
    icon: "🕊️",
    category: "Reflection",
    title: "Pray without a list",
    description: "Talk to God like a friend. No requests required.",
  },
  {
    icon: "✍️",
    category: "Reflection",
    title: "Journal about your week",
    description: "Not to optimize — to notice what God was doing.",
  },
  {
    icon: "✦",
    category: "Reflection",
    title: "Give thanks",
    description: "Name what God did this week. Out loud or in writing.",
  },
];

export const SABBATH_CATEGORIES = [
  "Worship",
  "Rest",
  "Relationships",
  "Wonder",
  "Reflection",
] as const;

export const sabbathOpeningMessages = [
  "Welcome to your Sabbath.",
  "Today is set apart.",
  "Rest is waiting for you.",
  "Today is not for striving.",
];

export const sabbathClosingBlessings = [
  "May your soul find rest today.",
  "Be still. He is God. — Psalm 46:10",
  "Sleep, eat, rest, worship. That is enough.",
  "The Sabbath was made for you. — Mark 2:27",
];
