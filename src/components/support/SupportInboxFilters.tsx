"use client";

import { cn } from "@/lib/utils";
import type { SupportInboxFilter } from "@/lib/support/supportConversationView";

export type SupportInboxFilterOption = {
  key: SupportInboxFilter;
  label: string;
};

type Props = {
  filters: SupportInboxFilterOption[];
  activeFilter: SupportInboxFilter;
  onFilterChange: (filter: SupportInboxFilter) => void;
};

export default function SupportInboxFilters({
  filters,
  activeFilter,
  onFilterChange,
}: Props) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter support tickets"
    >
      {filters.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onFilterChange(item.key)}
          aria-pressed={activeFilter === item.key}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition",
            activeFilter === item.key
              ? "border-sky-400/40 bg-sky-500/15 text-sky-900 dark:text-sky-200"
              : "border-slate-200/80 bg-white/80 text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
