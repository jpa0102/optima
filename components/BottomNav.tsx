"use client";

import { Home, ListChecks, Trophy } from "lucide-react";

export type NavTab = "home" | "check-in" | "journey";

type BottomNavProps = {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
};

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "check-in", label: "Check-in", icon: ListChecks },
  { id: "journey", label: "Journey", icon: Trophy },
] satisfies { id: NavTab; label: string; icon: typeof Home }[];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="sticky bottom-4 z-20 mx-auto mt-6 w-full max-w-md rounded-full border border-stone-200 bg-white/90 p-2 shadow-[0_4px_24px_rgba(28,25,23,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/85 dark:shadow-black/50">
      <div className="grid grid-cols-3 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 rounded-full px-3 py-2 text-[0.7rem] font-medium transition ${
                isActive ? "bg-stone-100 text-forest-700 dark:bg-white dark:text-zinc-950" : "text-stone-400 hover:bg-stone-50 hover:text-stone-600 dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
