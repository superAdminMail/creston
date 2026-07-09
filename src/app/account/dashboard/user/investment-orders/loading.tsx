import { Skeleton } from "@/components/ui/skeleton";

import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../_components/dashboardSurfaces";

function SummarySkeleton() {
  return (
    <div className="rounded-3xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <Skeleton className="h-3 w-24 rounded-full bg-white/10" />
      <Skeleton className="mt-3 h-8 w-20 rounded-2xl bg-white/10" />
      <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
    </div>
  );
}

function OrderCardSkeleton() {
  return (
    <article className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-7 w-44 rounded-full bg-white/10" />
            <Skeleton className="h-7 w-28 rounded-full bg-white/10" />
            <Skeleton className="h-7 w-32 rounded-full bg-white/10" />
          </div>

          <Skeleton className="h-4 w-full max-w-2xl rounded-full bg-white/10" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-20 rounded-full bg-white/10" />
                <Skeleton className="h-5 w-28 rounded-2xl bg-white/10" />
              </div>
            ))}
          </div>

          <Skeleton className="h-14 rounded-2xl bg-white/10" />
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[14rem] lg:pl-6">
          <Skeleton className="h-11 rounded-2xl bg-white/10" />
          <Skeleton className="h-11 rounded-2xl bg-white/10" />
          <Skeleton className="h-10 rounded-2xl bg-white/10" />
        </div>
      </div>
    </article>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <section className={`${DASHBOARD_PAGE_PANEL_CLASS} overflow-hidden p-5 sm:p-6 lg:p-8`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
            <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-white/10" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
          </div>

          <Skeleton className="h-11 w-40 rounded-2xl bg-white/10" />
        </div>
      </section>

      <section className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-5 sm:p-6 lg:p-8`}>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
            <Skeleton className="h-8 w-56 rounded-2xl bg-white/10" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:max-w-[34rem] 2xl:grid-cols-4 2xl:max-w-none">
            {Array.from({ length: 4 }).map((_, index) => (
              <SummarySkeleton key={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <OrderCardSkeleton key={index} />
        ))}
      </section>
    </div>
  );
}
