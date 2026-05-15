import type { ScoreSummary as ScoreSummaryType } from "@/types/optima";

type ScoreSummaryProps = {
  summary: ScoreSummaryType;
};

export function ScoreSummary({ summary }: ScoreSummaryProps) {
  return (
    <section className="rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-white/[0.14] via-white/[0.07] to-white/[0.03] p-6 shadow-2xl shadow-black/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-200/70">Today</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-white">{summary.score} / 100</h1>
        </div>
        <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white">
          {summary.rating.label}
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-white/62">{summary.rating.tone}</p>
      <div className="mt-5 h-3 rounded-full bg-white/10 p-1">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-300 via-emerald-200 to-cyan-200 transition-all"
          style={{ width: `${summary.score}%` }}
        />
      </div>
    </section>
  );
}
