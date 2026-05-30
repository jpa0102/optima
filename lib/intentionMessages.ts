import type { PinnedIntention } from "@/types/optima";

type TimeOfDay = "morning" | "midday" | "evening";

function getTimeOfDay(timeStr: string): TimeOfDay {
  const hour = parseInt(timeStr.split(":")[0], 10);
  if (hour < 12) return "morning";
  if (hour < 17) return "midday";
  return "evening";
}

const positiveMessages: Record<string, Record<TimeOfDay, string[]>> = {
  "morning-prayer": {
    morning: [
      "Before the day takes over — have you talked to God yet? Even 2 minutes changes everything.",
      "The best thing you can do right now is bring today to God before you bring it to anyone else.",
      "Good morning. God is already in this day. Step into it with Him. — Psalm 5:3",
    ],
    midday: [
      "Midday check-in: how's your heart? Take 60 seconds and bring it to God right now.",
      "The day is half done. Pause. Breathe. Talk to God about what's actually going on.",
      "You set an intention to pray today. There's still time. Even now.",
    ],
    evening: [
      "Before the day closes — have you prayed today? It's not too late. God is still listening.",
      "End this day the way it should end — with God. Tell Him how it went.",
      "Evening prayer is one of the most powerful habits you can build. Tonight is a good night to start.",
    ],
  },
  "daily-scripture-reading": {
    morning: [
      "Open the Word before you open anything else today. Even one verse feeds your spirit.",
      "Your Bible is waiting. 5 minutes of Scripture beats an hour of scrolling. — Psalm 119:105",
      "Start with the Word. Let God speak before the world does.",
    ],
    midday: [
      "Have you read the Bible today? There's still half a day left. Open it now — even one chapter.",
      "A verse a day is enough. What has God been saying to you lately?",
      "Midday reminder: the Word you read today is the armor you wear tomorrow.",
    ],
    evening: [
      "Before bed — read one passage. Let it be the last thing your mind holds before sleep.",
      "You intended to read Scripture today. Tonight is still today.",
      "End the day in the Word. Let God's voice be the loudest one you heard.",
    ],
  },
  "stillness-silence": {
    morning: [
      "Before the noise begins — find 5 minutes of silence. God speaks in the quiet.",
      "Be still and know. — Psalm 46:10. Can you find stillness before the day starts?",
      "The most productive thing you can do right now is be completely still for 5 minutes.",
    ],
    midday: [
      "Step away from the noise for 5 minutes. Close the door. Be still. Let God meet you there.",
      "Midday stillness resets everything. Take a break that actually restores you.",
      "Your soul needs quiet. Even 5 minutes of silence will change the rest of your day.",
    ],
    evening: [
      "Wind down with stillness tonight. No phone. No noise. Just you and God.",
      "The day was loud. Let the evening be quiet. 5 minutes of stillness before sleep.",
      "Silence before bed is a gift to your nervous system and your spirit both.",
    ],
  },
  "journal": {
    morning: [
      "3 minutes of journaling before the day begins sets the tone for everything. What's on your heart?",
      "Write it down before you start. What are you carrying today? Give it to God on paper.",
      "Morning pages don't have to be long. One honest sentence is enough.",
    ],
    midday: [
      "How's your day going? Take 3 minutes and write it down. Your future self will thank you.",
      "Journaling midday captures what's really happening — the feelings, the wins, the hard moments.",
      "Write something honest right now. You intended to journal today. Now is a good time.",
    ],
    evening: [
      "Before you sleep — write down 3 things that happened today. Even hard days are worth recording.",
      "Evening journaling is how you make sense of your day. Take 5 minutes before bed.",
      "What did God do today? What did you notice? Write it before sleep takes it.",
    ],
  },
  "phone-free-hour": {
    morning: [
      "First hour of the day — can you keep the phone down? You set this intention. Honor it.",
      "No phone for the next hour. See how different your morning feels without it.",
      "The phone can wait. Your morning cannot be reclaimed. Guard this hour.",
    ],
    midday: [
      "Phone-free hour this afternoon — block the next 60 minutes and protect your focus.",
      "Put the phone face-down right now. One hour. You'll be surprised what you get done.",
      "Your attention is your most valuable resource. Guard one hour of it today.",
    ],
    evening: [
      "Phone-free evening starts now. Screens down. Be present with whoever is around you.",
      "One hour without your phone tonight. Real rest. Real presence. Real connection.",
      "You intended to go phone-free today. The evening is the perfect time to honor that.",
    ],
  },
  "meaningful-conversation": {
    morning: [
      "Who needs to hear from you today? Send a text right now before the day gets busy.",
      "Intention for today: have one real conversation. Not small talk. Real.",
      "Think of one person you've been meaning to connect with. Reach out before noon.",
    ],
    midday: [
      "Have you had a real conversation today? Not just logistics — something that actually mattered.",
      "Midday: reach out to someone. A quick call, a voice message, a real text.",
      "Connection doesn't happen automatically. It has to be chosen. Choose it today.",
    ],
    evening: [
      "Before the day ends — did you have a real conversation with someone you love?",
      "Tonight: put the phone down and actually talk to whoever is with you.",
      "One meaningful conversation changes a relationship. Have you had yours today?",
    ],
  },
  "focused-work-block": {
    morning: [
      "Block the next 90 minutes right now. Phone away. One task. That's all.",
      "Your most important work deserves your best hours. Give it the morning.",
      "Deep work starts with a decision. Make it now — what's the one thing that matters most today?",
    ],
    midday: [
      "Afternoon deep work block — phone away, notifications off, one thing for 90 minutes.",
      "The midday slump is real. Fight it with focus. Pick one task and finish it.",
      "You set an intention to do focused work today. Protect the next hour.",
    ],
    evening: [
      "Did you get your focused work done today? If not — 45 minutes before you close out.",
      "Evening focus block: one last push before you shut down. Make it count.",
      "Work as unto the Lord — even the last task of the day deserves your full attention.",
    ],
  },
  "steps-7500": {
    morning: [
      "Start strong — take a morning walk before the day fully starts. Even 20 minutes counts.",
      "Your body needs movement today. Get outside early and let the rest follow.",
      "7,500 steps is easier than it sounds. Start now and it'll be done by noon.",
    ],
    midday: [
      "Check your steps. If you're behind — now is the perfect time for a walk.",
      "Midday walk: 15 minutes outside resets your focus, mood, and energy all at once.",
      "You intended to move your body today. Step away from the screen and take a walk.",
    ],
    evening: [
      "Evening walk before dinner. Your body, mind, and spirit will all thank you.",
      "Check your step count. If you're not at 7,500 — there's still time.",
      "An evening walk is one of the healthiest things you can do. Shoes on. Let's go.",
    ],
  },
  "tithe": {
    morning: [
      "Have you honored God with your finances this week? Giving is an act of trust.",
      "First fruits — the tithe is a reminder that everything you have belongs to Him.",
      "Today's a good day to give if you haven't yet. — Malachi 3:10",
    ],
    midday: [
      "Midday reminder: have you tithed this week? Stewardship is worship.",
      "Financial faithfulness is part of your walk with God. Is your giving current?",
      "Giving generously opens your hands to receive. Is there an act of giving due today?",
    ],
    evening: [
      "End the day in financial faithfulness. Have you honored God with your resources this week?",
      "Before the week closes — is your tithe current? Give before you go to sleep.",
      "Generosity is a spiritual discipline. Honor it tonight.",
    ],
  },
};

const drainMessages: Record<string, Record<TimeOfDay, string[]>> = {
  "pornography": {
    morning: [
      "Today you chose freedom. Guard the morning — it sets the tone. Close anything that pulls you away.",
      "Morning is when temptation is often strongest. You know that. Stay close to God right now.",
      "Before the day starts — remember why you're fighting for freedom. It's worth it. You're worth it.",
    ],
    midday: [
      "Midday check-in: how are you doing with your intention to stay free today? God is with you.",
      "If temptation is near right now — close it. Walk away. Call someone. You don't have to fight alone.",
      "You set an intention to walk in freedom today. Right now, in this moment — you can choose it.",
    ],
    evening: [
      "You're almost through the day. Don't give ground in the evening hours. Stay the course.",
      "Evening is often the hardest time. Be intentional about what you let in tonight.",
      "You chose freedom today. End the evening in a way that honors that choice. — 1 Cor 6:18",
    ],
  },
  "doomscrolling": {
    morning: [
      "Don't start the day on your phone. The news can wait. Your peace cannot.",
      "Every minute of morning scrolling costs you focus for the rest of the day. Guard this hour.",
      "You set an intention to limit mindless scrolling. Start that intention right now.",
    ],
    midday: [
      "Put the phone down. Whatever you're scrolling through right now — it can wait.",
      "Midday scroll check: is this restoring you or draining you? Be honest.",
      "You intended to limit doomscrolling today. Close the app. Do the real thing.",
    ],
    evening: [
      "Phone down before bed. Scrolling at night steals your sleep and your peace.",
      "Evening reminder: what you look at last affects how you sleep and how you wake.",
      "You chose to limit scrolling today. Honor that choice in the last hour of your evening.",
    ],
  },
  "excessive-social-media": {
    morning: [
      "Don't let the first thing you see be someone else's highlight reel. Put the phone down.",
      "Social media in the morning sets a comparison trap for your whole day. Skip it this morning.",
      "You intended to limit social media today. That starts right now — in the morning.",
    ],
    midday: [
      "How much time have you spent on social media today? Is it serving you or stealing from you?",
      "Midday check: close the apps. Be present in your actual life for the next few hours.",
      "You are more than your feed. Step away and remember what real life feels like.",
    ],
    evening: [
      "Evening scroll warning: social media at night raises anxiety and disrupts sleep.",
      "Before bed — close social media. Let your mind rest from comparison and noise.",
      "Your worth is not measured in likes. Put the phone down and rest in who God says you are.",
    ],
  },
  "pride-arrogance": {
    morning: [
      "Today's intention: lead with humility. Before the first meeting or conversation — choose it.",
      "Humility is a daily decision. Make it before the day gives you reasons not to.",
      "God opposes the proud but gives grace to the humble. — James 4:6. Start there.",
    ],
    midday: [
      "Midday check: have you listened more than you've talked today?",
      "How are you showing up in conversations? Are you seeking to understand — or to be right?",
      "Humility looks like asking questions, crediting others, and holding your opinions loosely.",
    ],
    evening: [
      "End the day with a humility check: whose voice did you elevate today besides your own?",
      "Did pride show up today? Name it honestly. Bring it to God. That's how it loses its power.",
      "The goal isn't to diminish yourself — it's to lift others. How did you do today?",
    ],
  },
  "procrastination": {
    morning: [
      "The thing you've been avoiding — do it first. Right now. Before anything else.",
      "Procrastination feeds on delay. Break it this morning with one small act of obedience.",
      "You know the thing. Do the thing. God will meet you in the doing.",
    ],
    midday: [
      "What are you avoiding right now? Name it. Then spend 25 minutes on it. Just 25.",
      "Midday check: have you moved your most important thing forward today?",
      "Slothfulness is a spiritual issue — and so is the courage to begin. Begin now.",
    ],
    evening: [
      "Before the day closes — did you do the thing you've been putting off?",
      "Even 20 minutes of progress before bed is better than another day of avoidance.",
      "Tomorrow's you will be grateful if tonight's you starts. Even a little. Go.",
    ],
  },
};

const genericPositive: Record<TimeOfDay, string[]> = {
  morning: [
    "You set an intention today. Honor it before the day gets away from you.",
    "Morning is the best time to act on what matters. Start now.",
    "Your intention is set. God is with you in it. Go.",
  ],
  midday: [
    "Midday check-in from Opti: how's your intention going today?",
    "You're halfway through the day. Is your intention still in front of you?",
    "Don't let the afternoon undo the morning. Keep going.",
  ],
  evening: [
    "Evening reminder: did you honor your intention today?",
    "Before the day closes — check in with what you set out to do.",
    "Today isn't over yet. There's still time to honor what you set out to do.",
  ],
};

const genericDrain: Record<TimeOfDay, string[]> = {
  morning: [
    "You chose freedom today. Guard the morning — it sets everything else.",
    "Your intention is to seek freedom from this. Morning is when that fight begins.",
    "Stay close to God today. You don't have to fight this alone.",
  ],
  midday: [
    "Midday check: how are you doing with your freedom intention? God sees your effort.",
    "If temptation showed up today — you can still choose differently right now.",
    "You're not defined by the struggle. You're defined by who you're becoming.",
  ],
  evening: [
    "You made it through most of the day. Don't give ground in the final hours.",
    "Evening is often hardest. Be intentional. You know what you need to avoid.",
    "His mercies are new every morning. Whatever today held — tomorrow is another chance.",
  ],
};

export function getIntentionMessage(intention: PinnedIntention, timeStr: string): string {
  const timeOfDay = getTimeOfDay(timeStr);
  const map = intention.habitKind === "drain" ? drainMessages : positiveMessages;
  const habitMessages = map[intention.habitId];

  if (habitMessages) {
    const pool = habitMessages[timeOfDay];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const fallback = intention.habitKind === "drain" ? genericDrain[timeOfDay] : genericPositive[timeOfDay];
  return fallback[Math.floor(Math.random() * fallback.length)];
}
