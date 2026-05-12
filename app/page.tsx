"use client";

import { useMemo, useState } from "react";
import { BottomNav, type NavTab } from "@/components/BottomNav";
import { Companion } from "@/components/Companion";
import { HabitButton } from "@/components/HabitButton";
import { ReflectionCard } from "@/components/ReflectionCard";
import { ScoreSummary } from "@/components/ScoreSummary";
import { StatCard } from "@/components/StatCard";
import { categories, habits, savedDays } from "@/data/habits";
import { buildScoreSummary } from "@/lib/scoring";

const starterHabitIds = [
  "quiet-prayer",
  "gratitude",
  "clear-mind",
  "protected-focus",
  "moved-body",
  "connected",
  "one-priority",
  "closed-loop",
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>(starterHabitIds);

  const summary = useMemo(() => buildScoreSummary(selectedHabitIds), [selectedHabitIds]);

  const toggleHabit = (habitId: string) => {
    setSelectedHabitIds((currentHabitIds) =>
      currentHabitIds.includes(habitId)
        ? currentHabitIds.filter((selectedId) => selectedId !== habitId)
        : [...currentHabitIds, habitId],
    );
  };

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(124,58,237,0.2),_transparent_30%),linear-gradient(180deg,_#101014_0%,_#07070a_48%,_#020203_100%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-4 pt-5">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-200/60">Óptima</p>
            <p className="mt-1 text-sm text-white/45">A compassionate mirror for today.</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs text-white/60">
            Today
          </div>
        </header>

        <div className="flex-1 space-y-5">
          {activeTab === "home" ? (
            <>
              <ScoreSummary summary={summary} />
              <Companion mood={summary.rating.companionMood} />
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Logged"
                  value={`${summary.selectedCount}/${summary.totalHabits}`}
                  helper="Honest check-ins matter more than perfect streaks."
                />
                <StatCard label="Rating" value={summary.rating.label} helper="Based on the 0–100 daily score." />
              </div>
              <ReflectionCard title="Category balance" eyebrow="Gentle scan">
                <div className="space-y-3">
                  {summary.categoryScores.map((categoryScore) => (
                    <div key={categoryScore.category}>
                      <div className="mb-1 flex items-center justify-between text-xs text-white/50">
                        <span>{categoryScore.category}</span>
                        <span>
                          {categoryScore.completed}/{categoryScore.total}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-white/55"
                          style={{ width: `${(categoryScore.completed / categoryScore.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ReflectionCard>
              <ReflectionCard title="Today’s reflection" eyebrow="Gentle prompt">
                <p className="text-sm leading-6 text-white/60">
                  What is one thing your day is asking you to notice without judging yourself for it?
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("check-in")}
                  className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/25 transition hover:bg-emerald-100"
                >
                  Continue check-in
                </button>
              </ReflectionCard>
            </>
          ) : null}

          {activeTab === "check-in" ? (
            <ReflectionCard title="Check in honestly" eyebrow="Daily actions">
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.26em] text-white/35">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {habits
                        .filter((habit) => habit.category === category)
                        .map((habit) => (
                          <HabitButton
                            key={habit.id}
                            habit={habit}
                            isSelected={selectedHabitIds.includes(habit.id)}
                            onToggle={toggleHabit}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </ReflectionCard>
          ) : null}

          {activeTab === "history" ? (
            <ReflectionCard title="Weekly rhythm" eyebrow="History">
              <p className="mb-4 text-sm leading-6 text-white/58">
                A soft look at recent days — not a verdict, just a pattern you can learn from.
              </p>
              <div className="space-y-3">
                {savedDays.map((day) => (
                  <article key={day.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{day.dateLabel}</p>
                        <p className="mt-1 text-xs leading-5 text-white/48">{day.reflection}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-white">{day.score} / 100</p>
                        <p className="text-xs text-white/45">{day.rating}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </ReflectionCard>
          ) : null}
        </div>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </main>
  );
}
