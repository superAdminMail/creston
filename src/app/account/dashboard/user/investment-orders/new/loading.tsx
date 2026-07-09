import { Skeleton } from "@/components/ui/skeleton";

import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../../_components/dashboardSurfaces";

function StepCardSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-12 w-12 rounded-2xl bg-white/10" />
          <Skeleton className="h-6 w-44 rounded-full bg-white/10" />
          <Skeleton className="h-4 w-56 rounded-full bg-white/10" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full bg-white/10" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 rounded-2xl bg-white/10" />
        ))}
      </div>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-7 w-36 rounded-full bg-white/10" />
        <Skeleton className="h-7 w-32 rounded-full bg-white/10" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
          >
            <Skeleton className="h-3 w-24 rounded-full bg-white/10" />
            <Skeleton className="mt-3 h-5 w-32 rounded-2xl bg-white/10" />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[1.75rem] border border-sky-200/70 bg-sky-50/90 p-5 shadow-sm dark:border-sky-400/20 dark:bg-sky-500/10">
        <Skeleton className="h-3 w-32 rounded-full bg-white/10" />
        <Skeleton className="mt-3 h-8 w-40 rounded-2xl bg-white/10" />
        <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <section className={`${DASHBOARD_PAGE_PANEL_CLASS} overflow-hidden p-5 sm:p-6 lg:p-8`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
            <Skeleton className="h-10 w-full max-w-2xl rounded-2xl bg-white/10" />
            <Skeleton className="h-5 w-full max-w-3xl rounded-full bg-white/10" />
          </div>
          <Skeleton className="h-12 w-40 rounded-2xl bg-white/10" />
        </div>
      </section>

      <section className={`${DASHBOARD_PAGE_SURFACE_CLASS} overflow-hidden p-5 sm:p-6 lg:p-8`}>
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-3">
              <Skeleton className="h-3 w-24 rounded-full bg-white/10" />
              <Skeleton className="h-5 w-48 rounded-full bg-white/10" />
            </div>
            <Skeleton className="h-7 w-16 rounded-full bg-white/10" />
          </div>
          <Skeleton className="h-2 rounded-full bg-white/10" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)]">
          <div className="space-y-6">
            <StepCardSkeleton />
            <StepCardSkeleton />
            <ReviewSkeleton />
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
              <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
              <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
              <div className="mt-5 space-y-3">
                <Skeleton className="h-11 rounded-2xl bg-white/10" />
                <Skeleton className="h-11 rounded-2xl bg-white/10" />
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
              <Skeleton className="h-4 w-36 rounded-full bg-white/10" />
              <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
              <Skeleton className="mt-2 h-4 w-3/4 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
