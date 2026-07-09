import { Skeleton } from "@/components/ui/skeleton";

import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../_components/dashboardSurfaces";

function StatSkeleton() {
  return (
    <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4"}>
      <Skeleton className="h-3 w-24 rounded-full bg-white/10" />
      <Skeleton className="mt-3 h-8 w-28 rounded-2xl bg-white/10" />
      <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4 sm:p-5"}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
          <Skeleton className="h-6 w-48 rounded-2xl bg-white/10" />
        </div>
        <Skeleton className="h-10 w-10 rounded-2xl bg-white/10" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-14 rounded-2xl bg-white/10" />
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-8">
      <section className={DASHBOARD_PAGE_PANEL_CLASS + " overflow-hidden p-6 md:p-8"}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
            <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-white/10" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl">
            <StatSkeleton />
            <StatSkeleton />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatSkeleton key={index} />
        ))}
      </section>

      <section className={DASHBOARD_PAGE_SURFACE_CLASS + " p-5 sm:p-6"}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
            <Skeleton className="h-8 w-56 rounded-2xl bg-white/10" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-32 rounded-2xl bg-white/10" />
            <Skeleton className="h-10 w-36 rounded-2xl bg-white/10" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <CardSkeleton />
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </section>
    </div>
  );
}
