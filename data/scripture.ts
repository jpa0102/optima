export type VerseEntry = {
  reference: string;
  text: string;
};

export const recoveryVerses: Record<string, VerseEntry> = {
  Physical: {
    reference: "1 Corinthians 6:19–20",
    text: "Your body is a temple of the Holy Spirit. You are not your own — you were bought with a price.",
  },
  Mental: {
    reference: "Romans 12:2",
    text: "Be transformed by the renewal of your mind, that you may discern what is the will of God.",
  },
  Spiritual: {
    reference: "James 4:8",
    text: "Draw near to God, and he will draw near to you.",
  },
  Stewardship: {
    reference: "Matthew 25:21",
    text: "Well done, good and faithful servant. You have been faithful over a little; I will set you over much.",
  },
  Relational: {
    reference: "1 John 4:19",
    text: "We love because he first loved us.",
  },
};

export const celebrationVerses: VerseEntry[] = [
  { reference: "Galatians 6:9",
    text: "Let us not grow weary of doing good, for in due season we will reap, if we do not give up." },
  { reference: "Hebrews 12:1",
    text: "Let us run with endurance the race that is set before us." },
  { reference: "Psalm 1:3",
    text: "He is like a tree planted by streams of water that yields its fruit in its season." },
];
