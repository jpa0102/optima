import type { Habit } from "@/types/optima";

type HabitButtonProps = {
  habit: Habit;
  isSelected: boolean;
  onToggle: (habitId: string) => void;
};

export function HabitButton({ habit, isSelected, onToggle }: HabitButtonProps) {
  const isDrain = habit.kind === "drain";
  const selectedStyles = isDrain
    ? "border-rose-300/60 bg-rose-300/15 shadow-lg shadow-rose-950/30"
    : "border-emerald-300/60 bg-emerald-300/15 shadow-lg shadow-emerald-950/30";
  const checkStyles = isDrain
    ? "border-rose-200 bg-rose-200 text-rose-950"
    : "border-emerald-200 bg-emerald-200 text-emerald-950";
  const pointLabel = habit.points > 0 ? `+${habit.points}` : `${habit.points}`;

  return (
    <button
      type="button"
      onClick={() => onToggle(habit.id)}
      aria-pressed={isSelected}
      className={`w-full rounded-3xl border p-4 text-left transition duration-200 ${
        isSelected ? selectedStyles : "border-white/10 bg-white/[0.06] hover:border-white/20 hover:bg-white/[0.09]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{habit.label}</p>
          <p className="mt-1 text-xs leading-5 text-white/55">{habit.description}</p>
        </div>
        <span
          className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${
            isSelected ? checkStyles : "border-white/20 text-white/30"
          }`}
        >
          {isSelected ? "✓" : ""}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-[0.68rem] uppercase tracking-[0.24em] text-white/35">
        <span>{habit.kind === "positive" ? "Positive action" : "Drain logged"}</span>
        <span>{pointLabel} pts</span>
      </div>
    </button>
  );
}
