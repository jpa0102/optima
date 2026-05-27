export type CategoryTip = {
  nudge: string;
  why: string;
  actions: string[];
  quickWin: string;
};

export const categoryTips: Record<string, CategoryTip[]> = {
  Physical: [
    {
      nudge: "Your body is asking for attention today.",
      why: "Physical habits directly regulate your mood, focus, and energy levels.",
      quickWin: "Stand up, walk to another room, and do 10 deep squats right now.",
      actions: [
        "Set a 20-minute walk on your calendar for today — even after dinner counts.",
        "Drink a full glass of water right now before doing anything else.",
        "Do 5 minutes of stretching — YouTube 'morning stretch 5 min' if unsure.",
        "Commit to a consistent sleep time tonight and set an alarm to wind down.",
      ],
    },
    {
      nudge: "Small physical resets change your entire mental state.",
      why: "Movement increases BDNF, the brain's growth hormone, within minutes.",
      quickWin: "Put on shoes right now. A 10-minute walk resets your nervous system.",
      actions: [
        "Swap one meal today for something with protein and vegetables.",
        "Set a hydration reminder every 2 hours on your phone.",
        "Do 10 pushups or jumping jacks — right now, before you scroll further.",
        "Get outside for natural light — even 10 minutes resets your circadian clock.",
      ],
    },
  ],

  Mental: [
    {
      nudge: "Your mind needs a reset, not more input.",
      why: "Chronic information overload keeps cortisol elevated and blocks deep thinking.",
      quickWin: "Put your phone face-down for the next 30 minutes. Just that.",
      actions: [
        "Open a notes app and write 3 sentences about how you actually feel right now.",
        "Set your phone to Do Not Disturb for the next 2 hours.",
        "Read 10 pages of a real book — not an article, not a thread.",
        "Name your current emotional state out loud. Labeling reduces its intensity.",
      ],
    },
    {
      nudge: "You have more mental clarity available — you just need to access it.",
      why: "5 minutes of focused breathing shifts your nervous system from reactive to clear.",
      quickWin: "Try box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s. Do it 4 times.",
      actions: [
        "Write down the one thought that keeps looping in your mind. Get it out.",
        "Do a brain dump: list every open task or worry on paper. It clears RAM.",
        "Turn off all notifications for 1 hour. Notice how your mind settles.",
        "Listen to one piece of music with no other task. Full presence, 3 minutes.",
      ],
    },
  ],

  Spiritual: [
    {
      nudge: "Something deeper in you is asking to be heard.",
      why: "People with a consistent spiritual practice report 40% lower anxiety levels.",
      quickWin: "Sit still for 2 minutes. No phone. No agenda. Just breathe and be.",
      actions: [
        "Write down one thing you believe about your own purpose — even one sentence.",
        "Step outside and spend 5 minutes just observing — sky, trees, sounds.",
        "Say one thing you're genuinely grateful for out loud, to no one in particular.",
        "Read one page from a book that challenges or nourishes your inner life.",
      ],
    },
    {
      nudge: "Reconnecting with what matters takes less time than you think.",
      why: "Reflection on purpose activates the brain's default mode network — your meaning-maker.",
      quickWin: "Ask yourself: what would make today feel meaningful? Write one word.",
      actions: [
        "Spend 5 minutes in prayer, meditation, or intentional silence.",
        "Do one small act of service today — hold a door, send an encouraging message.",
        "Reflect on a value you hold and whether today's actions reflected it.",
        "Forgive something small. Release it. Notice how your body responds.",
      ],
    },
  ],

  Relational: [
    {
      nudge: "The people in your life are waiting for you to show up.",
      why: "Harvard's 80-year study found relationships are the single strongest predictor of wellbeing.",
      quickWin: "Text one person right now: 'Thinking of you. How are you really doing?'",
      actions: [
        "Schedule a call or coffee with someone you haven't spoken to in weeks.",
        "Tell someone specific what you appreciate about them — in person or by text.",
        "Put your phone away during the next meal or conversation you have.",
        "Apologize or clear the air on something small that's been lingering.",
      ],
    },
    {
      nudge: "Connection is a skill — and you can practice it today.",
      why: "Even brief meaningful interactions trigger oxytocin and lower blood pressure.",
      quickWin: "Make full eye contact and ask someone 'how are you actually doing?'",
      actions: [
        "Share something honest about your day with someone you trust.",
        "Ask a deeper question in your next conversation instead of keeping it surface.",
        "Set a boundary you've been avoiding — calmly, without over-explaining.",
        "Spend 20 uninterrupted minutes with someone you care about. Phones away.",
      ],
    },
  ],

  Stewardship: [
    {
      nudge: "One focused hour beats a scattered day.",
      why: "Context switching costs up to 40% of productive time, per the APA.",
      quickWin: "Identify your single most important task. Work on only that for 25 minutes.",
      actions: [
        "Write your top 3 priorities for today in order. Do the first one before anything else.",
        "Close all tabs except what you need for the current task.",
        "Set a 90-minute focus block with phone in another room.",
        "Use the 2-minute rule: if it takes under 2 minutes, do it now and close the loop.",
      ],
    },
    {
      nudge: "Progress on one thing is worth more than busyness on ten.",
      why: "Completing your most important task triggers a dopamine loop that builds daily momentum.",
      quickWin: "Pick the task you've been avoiding. Set a 15-minute timer. Start it now.",
      actions: [
        "Plan tomorrow tonight — 5 minutes before bed prevents morning drift.",
        "Batch your messages and emails to 2 specific times today.",
        "Eliminate one recurring distraction — mute a group chat, block a site.",
        "Break your biggest stuck task into 3 smaller steps. Do step 1 today.",
      ],
    },
  ],
};

export function getTipForCategory(
  category: string,
  dayOffset = 0,
): CategoryTip | null {
  const tips = categoryTips[category];
  if (!tips || tips.length === 0) return null;
  return tips[dayOffset % tips.length];
}
