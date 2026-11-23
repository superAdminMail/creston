"use client";

import { Card, CardContent } from "@/components/ui/card";

type Props = {
  stats: {
    total: number;
    unread: number;
    open: number;
    waiting: number;
  };
};

export default function SupportTeamQueue({ stats }: Props) {
  const items = [
    { label: "Total tickets", value: stats.total },
    { label: "Unread", value: stats.unread },
    { label: "Open", value: stats.open },
    { label: "Pending", value: stats.waiting },
  ];

  return (
    <Card className="rounded-[1.9rem] text-slate-950 dark:text-white">
      <CardContent className="space-y-5 p-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
            Support ops
          </p>
          <h2 className="text-lg font-semibold tracking-tight">Team queue</h2>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
            Manage assignment, unread replies, and ticket state from a single
            operational view.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-sky-200/70 bg-sky-50/80 p-4 dark:border-sky-400/15 dark:bg-sky-400/[0.07]">
          <p className="text-sm font-semibold text-sky-950 dark:text-sky-200">
            Queue guidance
          </p>
          <p className="mt-1 text-sm leading-6 text-sky-900/80 dark:text-sky-100/70">
            Use the filters to find the queue you want, then assign or open the
            ticket directly from the list.
          </p>
        </div>

        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          Tip: High-priority work shows up faster when the queue is filtered to
          unread or unassigned tickets.
        </p>
      </CardContent>
    </Card>
  );
}
