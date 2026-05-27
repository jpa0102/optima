"use client";

export function SabbathScreen() {
  return (
    <div className="flex w-full flex-col items-center justify-center py-12 text-center">
      <span className="font-serif text-7xl text-amber-500">✦</span>

      <h1 className="mt-4 font-serif text-4xl font-black text-stone-800 dark:text-white">Sabbath</h1>

      <p className="mt-3 max-w-[260px] font-serif text-lg italic leading-8 text-stone-500 dark:text-white/60">
        &ldquo;Be still, and know that I am God.&rdquo;
      </p>
      <p className="mt-1 text-[11px] text-stone-400 dark:text-white/30">— Psalm 46:10</p>

      <p className="mt-6 max-w-[260px] text-sm leading-7 text-stone-500 dark:text-white/55">
        Today is not a day for tracking. It is a day for resting in what
        has already been done for you.
      </p>

      <div className="mt-8 rounded-2xl border border-stone-100 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <p className="text-xs text-stone-400 dark:text-white/25">
          Your streak is safe.<br />
          Rest is not absence — it is obedience.
        </p>
      </div>
    </div>
  );
}
