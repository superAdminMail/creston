import { Skeleton } from "@/components/ui/skeleton";

import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../_components/dashboardSurfaces";

function MetricSkeleton() {
  return (
    <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-10 w-10 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="h-7 w-16 rounded-full bg-slate-200/80 dark:bg-white/10" />
      </div>
      <Skeleton className="mt-4 h-4 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="mt-2 h-8 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="mt-3 h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-8">
      <section className={`${DASHBOARD_PAGE_PANEL_CLASS} overflow-hidden p-6 md:p-8`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Skeleton className="h-4 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl">
            <MetricSkeleton />
            <MetricSkeleton />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <MetricSkeleton key={index} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-5 sm:p-6`}>
          <Skeleton className="h-6 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="mt-3 h-4 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
          <div className="mt-6 h-[360px] rounded-[1.5rem] bg-slate-200/70 dark:bg-white/10" />
        </div>

        <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-5 sm:p-6`}>
          <Skeleton className="h-6 w-44 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl rounded-full bg-slate-200/80 dark:bg-white/10" />
          <div className="mt-6 h-[360px] rounded-[1.5rem] bg-slate-200/70 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}
