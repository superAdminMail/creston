"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SupportInboxSort } from "@/lib/support/supportConversationView";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  sort: SupportInboxSort;
  onSortChange: (value: SupportInboxSort) => void;
  canDeleteTickets: boolean;
  selectedCount: number;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  onToggleAllVisible: () => void;
  onClearSelection: () => void;
  onBatchDelete: () => void;
};

export default function SupportInboxToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  canDeleteTickets,
  selectedCount,
  allVisibleSelected,
  someVisibleSelected,
  onToggleAllVisible,
  onClearSelection,
  onBatchDelete,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />

        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search ticket ID, subject, name..."
          className="h-11 rounded-2xl border-border/60 bg-white/95 pl-10 text-slate-950 placeholder:text-slate-400 focus-visible:ring-sky-400/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />

        <Select
          value={sort}
          onValueChange={(value) => onSortChange(value as SupportInboxSort)}
        >
          <SelectTrigger className="h-10 flex-1 rounded-2xl border-border/60 bg-white/95 text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
            <SelectValue placeholder="Sort conversations" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="latest">Latest activity</SelectItem>
            <SelectItem value="newest">Newest created</SelectItem>
            <SelectItem value="oldest">Oldest created</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {canDeleteTickets ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white/75 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Checkbox
              checked={
                allVisibleSelected
                  ? true
                  : someVisibleSelected
                    ? "indeterminate"
                    : false
              }
              onCheckedChange={onToggleAllVisible}
              aria-label="Select all visible support tickets"
            />

            <span>
              {selectedCount
                ? `${selectedCount} selected`
                : "Select tickets for batch delete"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-8 rounded-full border border-border/60 bg-white/80 px-3 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
              >
                Clear
              </Button>
            ) : null}

            <Button
              type="button"
              size="sm"
              disabled={!selectedCount}
              onClick={onBatchDelete}
              className="h-8 rounded-full bg-red-600 px-3 text-xs text-white hover:bg-red-700"
            >
              Delete selected
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
