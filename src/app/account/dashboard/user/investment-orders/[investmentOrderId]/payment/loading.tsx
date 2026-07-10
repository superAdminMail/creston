import { Skeleton } from "@/components/ui/skeleton";

import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../../../_components/dashboardSurfaces";

export default function Loading() {
  return (
    <div className="space-y-6">
      <section className={`${DASHBOARD_PAGE_PANEL_CLASS} overflow-hidden p-5 sm:p-6`}>
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 shrink-0 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-5 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-4 w-full max-w-2xl rounded-full bg-slate-200/70 dark:bg-white/10" />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-16 rounded-2xl bg-slate-200/80 dark:bg-white/10"
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
        <div className="space-y-6">
          <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-5 sm:p-6`}>
            <Skeleton className="h-5 w-36 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-24 rounded-2xl bg-slate-200/80 dark:bg-white/10"
                />
              ))}
            </div>
          </div>

          <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-5 sm:p-6`}>
            <Skeleton className="h-5 w-44 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-4 w-11/12 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-4 w-10/12 rounded-full bg-slate-200/80 dark:bg-white/10" />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-12 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-12 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-5 sm:p-6`}>
            <Skeleton className="h-5 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-12 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-12 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-12 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            </div>
          </div>

          <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-5 sm:p-6`}>
            <Skeleton className="h-5 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-10 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-10 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-10 w-3/4 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
