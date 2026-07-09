import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../_components/dashboardSurfaces";

function LoadingMethodCard() {
  return (
    <div className="flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex min-w-0 items-start gap-3">
        <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-slate-200/80 dark:bg-white/10" />
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-4 w-40 max-w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-3 w-24 max-w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 shrink-0 rounded-full bg-slate-200/80 dark:bg-white/10" />
    </div>
  );
}

function LoadingRequestCard() {
  return (
    <div
      className={cn(
        DASHBOARD_PAGE_SURFACE_CLASS,
        "block h-full space-y-4 p-4 transition-colors duration-200",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-5 w-36 max-w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-4 w-48 max-w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>
        <Skeleton className="h-5 w-5 shrink-0 rounded-full bg-slate-200/80 dark:bg-white/10" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-3")}>
          <Skeleton className="h-3 w-20 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="mt-2 h-4 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="mt-2 h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>
        <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-3")}>
          <Skeleton className="h-3 w-20 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="mt-2 h-4 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>
      </div>

      <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-3")}>
        <Skeleton className="h-3 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="mt-2 h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="mt-2 h-4 w-10/12 rounded-full bg-slate-200/80 dark:bg-white/10" />
      </div>

      <Skeleton className="h-20 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-full max-w-48 rounded-full bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="h-4 w-full max-w-80 rounded-full bg-slate-200/80 dark:bg-white/10" />
      </div>

      <div className={cn(DASHBOARD_PAGE_PANEL_CLASS, "space-y-2 p-5 sm:p-6")}>
        <Skeleton className="h-4 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="h-10 w-full max-w-56 rounded-full bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="h-4 w-full max-w-72 rounded-full bg-slate-200/80 dark:bg-white/10" />
      </div>

      <div className="flex gap-2 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm dark:border-yellow-400/20 dark:bg-yellow-500/10">
        <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-yellow-200/80 dark:bg-yellow-400/20" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-full max-w-56 rounded-full bg-yellow-200/80 dark:bg-yellow-400/20" />
          <Skeleton className="h-4 w-full max-w-80 rounded-full bg-yellow-200/80 dark:bg-yellow-400/20" />
        </div>
      </div>

      <div className={cn(DASHBOARD_PAGE_PANEL_CLASS, "space-y-6 p-5 sm:p-6")}>
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-4 w-full max-w-72 rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-3 w-16 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-11 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-3 w-44 rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-3 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <div className="grid gap-3">
            <LoadingMethodCard />
            <LoadingMethodCard />
          </div>
        </div>

        <Skeleton className="h-12 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
      </div>

      <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "space-y-4 p-4 sm:p-5")}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-3 w-full max-w-72 rounded-full bg-slate-200/80 dark:bg-white/10" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <LoadingRequestCard />
          <LoadingRequestCard />
          <LoadingRequestCard />
        </div>
      </div>
    </div>
  );
}
