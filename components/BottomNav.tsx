import { BarChart3, Home, ListChecks } from "lucide-react";

export type NavTab = "home" | "check-in" | "history";

type BottomNavProps = {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
};

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "check-in", label: "Check-in", icon: ListChecks },
  { id: "history", label: "History", icon: BarChart3 },
] satisfies { id: NavTab; label: string; icon: typeof Home }[];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="sticky bottom-4 z-20 mx-auto mt-6 w-full max-w-md rounded-full border border-white/10 bg-zinc-950/85 p-2 shadow-2xl shadow-black/50 backdrop-blur">
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
                isActive ? "bg-white text-zinc-950" : "text-white/45 hover:bg-white/10 hover:text-white"
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
