"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, LoaderCircle, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { dismissDashboardSuccessNotice } from "@/actions/notifications/dismissDashboardSuccessNotice";
import { Button } from "@/components/ui/button";

export type DashboardSuccessNotice = {
  id: string;
  title: string;
  message: string;
  href: string | null;
};

export function DashboardSuccessNotices({
  notices,
}: {
  notices: DashboardSuccessNotice[];
}) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [pendingNoticeId, setPendingNoticeId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const visibleNotices = notices.filter((notice) => !dismissedIds.has(notice.id));

  if (visibleNotices.length === 0) {
    return null;
  }

  function dismissNotice(notificationId: string) {
    setPendingNoticeId(notificationId);

    startTransition(async () => {
      const result = await dismissDashboardSuccessNotice(notificationId);

      if (!result.ok) {
        toast.error(result.message);
        setPendingNoticeId(null);
        return;
      }

      setDismissedIds((current) => new Set(current).add(notificationId));
      setPendingNoticeId(null);
    });
  }

  return (
    <section className="space-y-3" aria-label="Account updates">
      {visibleNotices.map((notice) => {
        const isDismissing = isPending && pendingNoticeId === notice.id;

        return (
          <div
            key={notice.id}
            className="relative overflow-hidden rounded-[1.5rem] border border-emerald-200/90 bg-[linear-gradient(135deg,rgba(236,253,245,0.98),rgba(240,249,255,0.96))] px-4 py-4 shadow-sm dark:border-emerald-400/20 dark:bg-[linear-gradient(135deg,rgba(6,78,59,0.42),rgba(12,74,110,0.32))] sm:px-5"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500" />
            <div className="flex items-start gap-3 pr-8 sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-white/80 text-emerald-700 shadow-sm dark:border-emerald-400/20 dark:bg-slate-950/30 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  {notice.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-200">
                  {notice.message}
                </p>
                {notice.href ? (
                  <Link
                    href={notice.href}
                    className="mt-3 inline-flex items-center rounded-full border border-emerald-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50 dark:border-emerald-400/20 dark:bg-slate-950/40 dark:text-emerald-200 dark:hover:bg-slate-950/70"
                  >
                    View details
                  </Link>
                ) : null}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-3 top-3 text-slate-500 hover:bg-white/80 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-950/40 dark:hover:text-white"
              onClick={() => dismissNotice(notice.id)}
              disabled={isDismissing}
              aria-label={`Dismiss ${notice.title}`}
            >
              {isDismissing ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
      })}
    </section>
  );
}
