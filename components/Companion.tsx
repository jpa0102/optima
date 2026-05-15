import type { CompanionMood } from "@/types/optima";

type CompanionProps = {
  mood: CompanionMood;
};

const moodStyles: Record<CompanionMood, { glow: string; face: string; message: string; mouth: string }> = {
  bright: {
    glow: "from-emerald-300/45 via-teal-300/25 to-cyan-300/10",
    face: "bg-emerald-200 text-emerald-950",
    message: "Soft smile. Keep listening to what helped.",
    mouth: "h-3 w-8 rounded-b-full border-b-4 border-emerald-950",
  },
  steady: {
    glow: "from-amber-200/45 via-orange-300/20 to-rose-300/10",
    face: "bg-amber-200 text-amber-950",
    message: "Steady friend. Mixed days still teach clearly.",
    mouth: "h-1.5 w-8 rounded-full bg-amber-950/80",
  },
  tender: {
    glow: "from-violet-300/40 via-fuchsia-300/20 to-slate-500/10",
    face: "bg-violet-200 text-violet-950",
    message: "Gentle witness. No shame, just a kind reset.",
    mouth: "h-3 w-7 rounded-t-full border-t-4 border-violet-950",
  },
};

export function Companion({ mood }: CompanionProps) {
  const style = moodStyles[mood];

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/30">
      <div className={`absolute inset-0 bg-gradient-to-br ${style.glow}`} />
      <div className="relative flex items-center gap-4">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-[2rem] bg-white/10 shadow-inner shadow-white/10">
          <div className={`flex h-16 w-16 flex-col items-center justify-center gap-2 rounded-3xl ${style.face} shadow-lg shadow-black/20`}>
            <div className="flex gap-4">
              <span className="h-2.5 w-2.5 rounded-full bg-current" />
              <span className="h-2.5 w-2.5 rounded-full bg-current" />
            </div>
            <span className={style.mouth} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Companion</p>
          <p className="mt-2 text-lg font-semibold text-white">{style.message}</p>
        </div>
      </div>
    </section>
  );
}
