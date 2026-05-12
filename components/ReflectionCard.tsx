type ReflectionCardProps = {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
};

export function ReflectionCard({ title, eyebrow, children }: ReflectionCardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-zinc-950/70 p-5 shadow-xl shadow-black/25">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">{eyebrow}</p> : null}
      <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
