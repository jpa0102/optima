type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/35">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {helper ? <p className="mt-1 text-xs leading-5 text-white/45">{helper}</p> : null}
    </article>
  );
}
