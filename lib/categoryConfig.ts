import type { Category } from "@/types/optima";

export type CategoryAccent = {
  accent: string;
  glow: string;
  border: string;
  bg: string;
  text: string;
  bar: string;
};

export const categoryConfig: Record<Category, CategoryAccent> = {
  Physical:     { accent: "#2d6a4f", glow: "rgba(45,106,79,0.12)",   border: "rgba(45,106,79,0.2)",   bg: "rgba(45,106,79,0.06)",   text: "text-emerald-800", bar: "bg-emerald-700" },
  Mental:       { accent: "#1e3a5f", glow: "rgba(30,58,95,0.12)",    border: "rgba(30,58,95,0.2)",    bg: "rgba(30,58,95,0.06)",    text: "text-slate-800",   bar: "bg-slate-800"   },
  Spiritual:    { accent: "#5b21b6", glow: "rgba(91,33,182,0.12)",   border: "rgba(91,33,182,0.2)",   bg: "rgba(91,33,182,0.06)",   text: "text-violet-800",  bar: "bg-violet-700"  },
  Stewardship:  { accent: "#92400e", glow: "rgba(146,64,14,0.12)",   border: "rgba(146,64,14,0.2)",   bg: "rgba(146,64,14,0.06)",   text: "text-amber-800",   bar: "bg-amber-800"   },
  Relational:   { accent: "#9d174d", glow: "rgba(157,23,77,0.12)",   border: "rgba(157,23,77,0.2)",   bg: "rgba(157,23,77,0.06)",   text: "text-rose-800",    bar: "bg-rose-800"    },
};

export const categoryEmoji: Record<Category, string> = {
  Spiritual:    "🙏",
  Mental:       "🧠",
  Physical:     "💪",
  Relational:   "🤝",
  Stewardship:  "⚡",
};
