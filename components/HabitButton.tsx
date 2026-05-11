import type { Habit } from "@/types/optima";

type HabitButtonProps = {
  habit: Habit;
  isSelected: boolean;
  onToggle: (habitId: string) => void;
};

export function HabitButton({ habit, isSelected, onToggle }: HabitButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(habit.id)}
      aria-pressed={isSelected}
      className={`w-full rounded-3xl border p-4 text-left transition duration-200 ${
        isSelected
          ? "border-emerald-300/60 bg-emerald-300/15 shadow-lg shadow-emerald-950/30"
          : "border-white/10 bg-white/[0.06] hover:border-white/20 hover:bg-white/[0.09]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{habit.label}</p>
          <p className="mt-1 text-xs leading-5 text-white/55">{habit.description}</p>
        </div>
        <span
          className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${
            isSelected ? "border-emerald-200 bg-emerald-200 text-emerald-950" : "border-white/20 text-white/30"
          }`}
        >
          {isSelected ? "✓" : ""}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-[0.68rem] uppercase tracking-[0.24em] text-white/35">
        <span>{habit.category}</span>
        <span>{habit.points} pts</span>
      </div>
    </button>
  );
}
