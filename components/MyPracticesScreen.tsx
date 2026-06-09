"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { categoryEmoji } from "@/lib/categoryConfig";
import {
  getPersonalizedHabits,
  PROFILE_LABELS,
  STRUGGLE_LABELS,
} from "@/lib/userProfile";
import type { Category, Habit, UserProfile } from "@/types/optima";

type Props = {
  allHabits: Habit[];
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onOpenSettings: () => void;
  onClose: () => void;
};

const TABS: Array<"All" | Category> = ["All", "Spiritual", "Mental", "Physical", "Relational", "Stewardship"];

const tabColor: Record<Category, string> = {
  Spiritual:   "bg-violet-100 text-violet-700 border-violet-200",
  Mental:      "bg-blue-100 text-blue-700 border-blue-200",
  Physical:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  Relational:  "bg-pink-100 text-pink-700 border-pink-200",
  Stewardship: "bg-amber-100 text-amber-700 border-amber-200",
};

const toggleColor: Record<Category, string> = {
  Spiritual:   "bg-violet-500",
  Mental:      "bg-blue-500",
  Physical:    "bg-emerald-500",
  Relational:  "bg-pink-500",
  Stewardship: "bg-amber-500",
};

export function MyPracticesScreen({ allHabits, userProfile, onUpdateProfile, onOpenSettings, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"All" | Category>("All");
  const [search, setSearch] = useState("");
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const personalizedHabits = useMemo(
    () => getPersonalizedHabits(allHabits, userProfile),
    [allHabits, userProfile],
  );

  const visibleHabitIds = useMemo(
    () => new Set(personalizedHabits.map((h) => h.id)),
    [personalizedHabits],
  );

  const filteredHabits = useMemo(() => {
    let list = allHabits.filter((h) => h.kind === "positive");
    if (activeTab !== "All") list = list.filter((h) => h.category === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((h) => h.label.toLowerCase().includes(q));
    }
    return list;
  }, [allHabits, activeTab, search]);

  const drainHabits = useMemo(() => {
    let list = allHabits.filter((h) => h.kind === "drain");
    if (activeTab !== "All") list = list.filter((h) => h.category === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((h) => h.label.toLowerCase().includes(q));
    }
    return list;
  }, [allHabits, activeTab, search]);

  const toggleHabit = (habit: Habit) => {
    const isPersonalized = visibleHabitIds.has(habit.id);
    let hiddenHabitIds = [...userProfile.hiddenHabitIds];
    let customHabitIds = [...userProfile.customHabitIds];

    if (isPersonalized) {
      // Hide it
      if (!hiddenHabitIds.includes(habit.id)) hiddenHabitIds.push(habit.id);
      customHabitIds = customHabitIds.filter((id) => id !== habit.id);
    } else {
      // Show it (add to custom, remove from hidden)
      hiddenHabitIds = hiddenHabitIds.filter((id) => id !== habit.id);
      if (!customHabitIds.includes(habit.id)) customHabitIds.push(habit.id);
    }

    onUpdateProfile({ ...userProfile, hiddenHabitIds, customHabitIds });
  };

  const positiveCount = personalizedHabits.filter((h) => h.kind === "positive").length;
  const drainCount = personalizedHabits.filter((h) => h.kind === "drain").length;

  // Profile summary chips
  const profileChips: string[] = [];
  if (userProfile.lifeSeason !== "busy_full") {
    profileChips.push(PROFILE_LABELS.lifeSeason[userProfile.lifeSeason]);
  }
  if (userProfile.faithStage !== "growing") {
    profileChips.push(PROFILE_LABELS.faithStage[userProfile.faithStage]);
  }
  if (userProfile.relationshipStatus !== "prefer_not_to_say") {
    profileChips.push(PROFILE_LABELS.relationshipStatus[userProfile.relationshipStatus]);
  }
  if (userProfile.currentStruggles.length > 0) {
    profileChips.push(`${userProfile.currentStruggles.length} struggle${userProfile.currentStruggles.length !== 1 ? "s" : ""} noted`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      className="fixed inset-0 z-50 flex flex-col bg-parchment-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 bg-white px-5 py-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-forest-600">MY PRACTICES</p>
          <h1 className="font-serif text-xl font-black text-stone-900">Customize your habits</h1>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-400 transition hover:text-stone-700"
        >
          ✕
        </button>
      </div>

      {/* Life stage banner */}
      <div className="border-b border-stone-100 bg-forest-50 px-5 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-forest-600">
              Personalized for you
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {profileChips.length > 0 ? (
                profileChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-forest-200 bg-forest-100 px-2 py-0.5 text-[10px] font-semibold text-forest-700"
                  >
                    {chip}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-stone-400">Update your profile to personalize</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowProfileEdit(true)}
            className="shrink-0 rounded-full border border-forest-200 bg-white px-3 py-1.5 text-[11px] font-bold text-forest-700 transition hover:bg-forest-100"
          >
            Edit profile
          </button>
        </div>
        <p className="mt-2 text-[10px] text-stone-400">
          {positiveCount} practices · {drainCount} drains active — tap any habit to toggle
        </p>
      </div>

      {/* Search */}
      <div className="border-b border-stone-100 bg-white px-5 py-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search habits..."
          className="w-full rounded-full border border-stone-200 bg-parchment-100 px-4 py-2 text-sm text-stone-700 placeholder:text-stone-300 focus:border-forest-300 focus:outline-none"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-stone-100 bg-white px-4 py-3 scrollbar-none">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          const cls =
            tab === "All"
              ? isActive
                ? "bg-stone-800 text-white border-stone-800"
                : "bg-stone-100 text-stone-500 border-stone-100"
              : isActive
                ? tabColor[tab as Category]
                : "bg-stone-50 text-stone-400 border-stone-100";
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${cls}`}
            >
              {tab !== "All" && categoryEmoji[tab as Category]} {tab}
            </button>
          );
        })}
      </div>

      {/* Habit list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filteredHabits.length === 0 && drainHabits.length === 0 ? (
          <p className="mt-8 text-center text-sm text-stone-400">No habits match your search.</p>
        ) : (
          <>
            {filteredHabits.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-forest-600">
                  PRACTICES
                </p>
                <div className="space-y-2">
                  {filteredHabits.map((habit) => {
                    const on = visibleHabitIds.has(habit.id);
                    return (
                      <HabitRow
                        key={habit.id}
                        habit={habit}
                        isOn={on}
                        toggleColor={toggleColor[habit.category]}
                        onToggle={() => toggleHabit(habit)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {drainHabits.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-rose-500">
                  DRAINS TO TRACK
                </p>
                <div className="space-y-2">
                  {drainHabits.map((habit) => {
                    const on = visibleHabitIds.has(habit.id);
                    return (
                      <HabitRow
                        key={habit.id}
                        habit={habit}
                        isOn={on}
                        toggleColor="bg-rose-500"
                        onToggle={() => toggleHabit(habit)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-xs font-semibold text-stone-400 transition hover:text-stone-600"
          >
            ⚙ App settings (Sabbath day, notifications)
          </button>
        </div>
        <div className="h-8" />
      </div>

      {/* Profile edit bottom sheet */}
      <AnimatePresence>
        {showProfileEdit && (
          <ProfileEditPanel
            userProfile={userProfile}
            onSave={(updated) => {
              onUpdateProfile(updated);
              setShowProfileEdit(false);
            }}
            onClose={() => setShowProfileEdit(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── HabitRow ─────────────────────────────────────────────────────────────────

function HabitRow({
  habit,
  isOn,
  toggleColor,
  onToggle,
}: {
  habit: Habit;
  isOn: boolean;
  toggleColor: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-3 rounded-2xl border border-stone-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-stone-200"
    >
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold leading-5 ${isOn ? "text-stone-800" : "text-stone-300"}`}>
          {habit.label}
        </p>
        {habit.rhythm && (
          <span
            className={`mt-0.5 inline-flex text-[9px] font-bold uppercase tracking-wider ${
              isOn
                ? habit.rhythm === "daily"
                  ? "text-forest-500"
                  : "text-blue-500"
                : "text-stone-300"
            }`}
          >
            {habit.rhythm}
          </span>
        )}
      </div>
      {/* Toggle */}
      <div
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          isOn ? toggleColor : "bg-stone-200"
        }`}
      >
        <motion.div
          layout
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
          animate={{ left: isOn ? "calc(100% - 22px)" : "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      </div>
    </button>
  );
}

// ── ProfileEditPanel (inline bottom sheet) ───────────────────────────────────

type ProfileKey = keyof Omit<UserProfile, "customHabitIds" | "hiddenHabitIds" | "pinnedHabitIds">;

type ProfileField = {
  key: ProfileKey;
  label: string;
  options: Array<{ label: string; value: string }>;
  multiSelect?: boolean;
};

const PROFILE_FIELDS: ProfileField[] = [
  {
    key: "lifeSeason",
    label: "Life season",
    options: Object.entries(PROFILE_LABELS.lifeSeason).map(([v, l]) => ({ value: v, label: l })),
  },
  {
    key: "faithStage",
    label: "Faith stage",
    options: Object.entries(PROFILE_LABELS.faithStage).map(([v, l]) => ({ value: v, label: l })),
  },
  {
    key: "relationshipStatus",
    label: "Relationship",
    options: Object.entries(PROFILE_LABELS.relationshipStatus).map(([v, l]) => ({ value: v, label: l })),
  },
  {
    key: "hasChildren",
    label: "Children at home",
    options: Object.entries(PROFILE_LABELS.hasChildren).map(([v, l]) => ({ value: v, label: l })),
  },
  {
    key: "workSituation",
    label: "Work",
    options: Object.entries(PROFILE_LABELS.workSituation).map(([v, l]) => ({ value: v, label: l })),
  },
  {
    key: "healthConsideration",
    label: "Health",
    options: Object.entries(PROFILE_LABELS.healthConsideration).map(([v, l]) => ({ value: v, label: l })),
  },
  {
    key: "currentStruggles",
    label: "Struggles",
    multiSelect: true,
    options: Object.entries(STRUGGLE_LABELS).map(([v, l]) => ({ value: v, label: l })),
  },
];

function ProfileEditPanel({
  userProfile,
  onSave,
  onClose,
}: {
  userProfile: UserProfile;
  onSave: (updated: UserProfile) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<UserProfile>({ ...userProfile });

  const handleSingleSelect = (key: ProfileKey, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const toggleStruggle = (value: string) => {
    const struggles = draft.currentStruggles;
    if (struggles.includes(value as never)) {
      setDraft((prev) => ({
        ...prev,
        currentStruggles: struggles.filter((s) => s !== value) as typeof struggles,
      }));
    } else {
      setDraft((prev) => ({
        ...prev,
        currentStruggles: [...struggles, value as never],
      }));
    }
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      className="fixed inset-x-0 bottom-0 z-60 flex max-h-[90vh] flex-col rounded-t-3xl bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
        <h2 className="font-serif text-lg font-black text-stone-900">Edit your profile</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-400"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {PROFILE_FIELDS.map((field) => (
          <div key={field.key}>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-forest-600">
              {field.label}
            </p>
            {field.multiSelect ? (
              <div className="flex flex-wrap gap-2">
                {field.options.map((opt) => {
                  const isOn = draft.currentStruggles.includes(opt.value as never);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleStruggle(opt.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        isOn
                          ? "border-forest-300 bg-forest-50 text-forest-700"
                          : "border-stone-200 bg-stone-50 text-stone-500"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {field.options.map((opt) => {
                  const currentVal = draft[field.key];
                  const isOn = currentVal === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSingleSelect(field.key, opt.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        isOn
                          ? "border-forest-300 bg-forest-50 text-forest-700"
                          : "border-stone-200 bg-stone-50 text-stone-500"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        <div className="h-4" />
      </div>

      <div className="border-t border-stone-100 px-5 py-4">
        <button
          type="button"
          onClick={() => onSave(draft)}
          className="w-full rounded-full bg-forest-700 py-4 text-sm font-black text-white transition hover:bg-forest-800"
        >
          Save changes ✦
        </button>
      </div>
    </motion.div>
  );
}
