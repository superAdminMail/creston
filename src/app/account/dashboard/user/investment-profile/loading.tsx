import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../_components/dashboardSurfaces";

function DetailSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm dark:bg-white/[0.04]">
      <Skeleton className="h-3 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="mt-4 h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="mt-3 h-4 w-5/6 rounded-full bg-slate-200/80 dark:bg-white/10" />
    </div>
  );
}

function SurfaceSkeleton({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-6`}>
      {children}
    </section>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-10 w-full max-w-md rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>

        <Skeleton className="h-11 w-36 rounded-xl bg-slate-200/80 dark:bg-white/10" />
      </div>

      <section className={`${DASHBOARD_PAGE_PANEL_CLASS} overflow-hidden p-6 sm:p-8`}>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <Skeleton className="h-8 w-56 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />

            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-9 w-44 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-9 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
            </div>
          </div>

          <div className="w-full max-w-sm rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:bg-white/[0.04]">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="h-10 w-24 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
              </div>
              <div className="space-y-3 text-right">
                <Skeleton className="h-3 w-20 rounded-full bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="h-4 w-20 rounded-full bg-slate-200/80 dark:bg-white/10" />
              </div>
            </div>

            <Skeleton className="mt-5 h-2.5 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="mt-4 h-5 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="mt-3 h-5 w-5/6 rounded-full bg-slate-200/80 dark:bg-white/10" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceSkeleton>
          <div className="space-y-3">
            <Skeleton className="h-5 w-48 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-4 w-72 rounded-full bg-slate-200/80 dark:bg-white/10" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <DetailSkeleton key={index} />
            ))}
          </div>
        </SurfaceSkeleton>

        <div className="space-y-6">
          <SurfaceSkeleton>
            <Skeleton className="h-5 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-12 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-12 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            </div>
          </SurfaceSkeleton>

          <SurfaceSkeleton>
            <Skeleton className="h-5 w-36 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border/60 bg-white/75 p-4 shadow-sm dark:bg-white/[0.04]"
                >
                  <Skeleton className="h-4 w-44 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <Skeleton className="mt-3 h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <Skeleton className="mt-2 h-4 w-5/6 rounded-full bg-slate-200/80 dark:bg-white/10" />
                </div>
              ))}
            </div>
          </SurfaceSkeleton>
        </div>
      </section>
    </div>
  );
}
