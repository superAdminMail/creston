"use client";

import { ArrowRight, MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  stats: {
    total: number;
    unread: number;
    open: number;
    waiting: number;
  };
  onCreateTicket: () => void;
};

export default function SupportUserSidebar({ stats, onCreateTicket }: Props) {
  const items = [
    { label: "Open threads", value: stats.open },
    { label: "Unread replies", value: stats.unread },
  ];

  const steps = [
    "Create one ticket for each new issue so replies stay easy to track.",
    "Support replies inside the same thread and your inbox updates live.",
    "Use the ticket list to jump back into any conversation at any time.",
  ];

  return (
    <aside className="space-y-5">
      <Card className="rounded-[1.9rem] text-slate-950 dark:text-white">
        <CardContent className="space-y-5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
              <MessageSquareText className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
                Support center
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                Help from one secure place
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Track every request, continue existing threads, and create a new
                ticket when you need fresh help.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-slate-600 dark:text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[1.9rem] text-slate-950 dark:text-white">
        <CardContent className="space-y-5 p-5">
          <div>
            <h3 className="text-base font-semibold">What to expect</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              A simple way to keep your support conversations organized.
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-xs font-semibold text-sky-800 dark:text-sky-300">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-sm font-semibold">Need a new request?</p>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Start a new conversation with the support team.
            </p>

            <Button
              type="button"
              onClick={onCreateTicket}
              className="mt-4 w-full rounded-full bg-[#3c9ee0] text-white hover:bg-[#2f8bd0]"
            >
              New support ticket
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
