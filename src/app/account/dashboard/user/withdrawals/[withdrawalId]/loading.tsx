import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../../_components/dashboardSurfaces";

function LoadingBackLink() {
  return (
    <div className="inline-flex items-center gap-2">
      <Skeleton className="h-4 w-4 rounded-full bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="h-4 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
    </div>
  );
}

function LoadingReceiptRow() {
  return (
    <div className="grid gap-3 py-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-start sm:py-4">
      <Skeleton className="h-3 w-28 rounded-full bg-slate-200/80 dark:bg-white/10 sm:mt-1" />
      <div className="min-w-0 space-y-2 sm:text-right">
        <Skeleton className="h-4 w-full max-w-48 rounded-full bg-slate-200/80 dark:bg-white/10 sm:ml-auto" />
        <Skeleton className="h-3 w-full max-w-40 rounded-full bg-slate-200/80 dark:bg-white/10 sm:ml-auto" />
      </div>
    </div>
  );
}

function LoadingSummaryCard() {
  return (
    <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "px-4 sm:px-5")}>
      <LoadingReceiptRow />
      <LoadingReceiptRow />
      <LoadingReceiptRow />
      <LoadingReceiptRow />
    </div>
  );
}

function LoadingStatusCard({
  tone = "slate",
  rows = 3,
}: {
  tone?: "slate" | "rose" | "emerald";
  rows?: number;
}) {
  const toneClassName =
    tone === "rose"
        ? "border-rose-200 bg-rose-50 dark:border-rose-400/20 dark:bg-rose-500/10"
        : tone === "emerald"
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-500/10"
          : "border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/[0.04]";

  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm sm:p-5", toneClassName)}>
      <div className="space-y-3">
            <Skeleton
              className={cn(
                "h-3 rounded-full bg-slate-200/80 dark:bg-white/10",
                tone === "rose"
                  ? "w-32"
                  : tone === "emerald"
                  ? "w-36"
                  : "w-24",
              )}
            />
        <Skeleton className="h-5 w-full max-w-72 rounded-full bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="h-4 w-full max-w-96 rounded-full bg-slate-200/80 dark:bg-white/10" />
      </div>

      {rows > 0 ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton
              key={`${tone}-action-${index}`}
              className="h-10 w-full rounded-full bg-slate-200/80 dark:bg-white/10 sm:w-40"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Loading() {
  return (
    <div className="relative mx-auto min-h-[calc(100vh-5rem)] w-full max-w-6xl">
      <div className="absolute inset-x-4 top-8 -z-10 h-40 rounded-[2rem] bg-[#3c9ee0]/10 blur-3xl" />

      <div className="space-y-6">
        <LoadingBackLink />

        <section className={cn(DASHBOARD_PAGE_PANEL_CLASS, "overflow-hidden")}>
          <div className="relative p-4 sm:p-6 md:p-8">
            <div className="relative space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-3">
                  <Skeleton className="h-6 w-40 rounded-full bg-sky-200/80 dark:bg-sky-400/20" />
                  <Skeleton className="h-11 w-full max-w-72 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <Skeleton className="h-4 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <Skeleton className="h-4 w-full max-w-xl rounded-full bg-slate-200/80 dark:bg-white/10" />
                </div>

                <Skeleton className="h-8 w-full max-w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <LoadingSummaryCard />
                <LoadingSummaryCard />
              </div>

              <LoadingStatusCard tone="slate" rows={2} />

              <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-4 sm:p-5")}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <Skeleton className="h-3 w-36 rounded-full bg-slate-200/80 dark:bg-white/10" />
                    <Skeleton className="h-5 w-full max-w-80 rounded-full bg-slate-200/80 dark:bg-white/10" />
                    <Skeleton className="h-4 w-full max-w-96 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-full bg-slate-200/80 dark:bg-white/10 sm:w-44" />
                </div>
              </div>

              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm sm:p-5 dark:border-sky-400/20 dark:bg-sky-500/10">
                <div className="space-y-3">
                  <Skeleton className="h-3 w-28 rounded-full bg-sky-200/80 dark:bg-sky-400/20" />
                  <Skeleton className="h-4 w-full max-w-96 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <Skeleton className="h-4 w-full max-w-80 rounded-full bg-slate-200/80 dark:bg-white/10" />
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Skeleton className="h-10 w-full rounded-full bg-slate-200/80 dark:bg-white/10 sm:w-40" />
                  <Skeleton className="h-10 w-full rounded-full bg-slate-200/80 dark:bg-white/10 sm:w-44" />
                </div>
              </div>

              <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-4 sm:p-5")}>
                <Skeleton className="h-3 w-36 rounded-full bg-slate-200/80 dark:bg-white/10" />
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-4")}>
                    <Skeleton className="h-4 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
                    <Skeleton className="mt-2 h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
                    <Skeleton className="mt-4 h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
                    <Skeleton className="mt-2 h-4 w-10/12 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  </div>
                  <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-4")}>
                    <Skeleton className="h-4 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
                    <Skeleton className="mt-2 h-3 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
                    <Skeleton className="mt-4 h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
                    <Skeleton className="mt-2 h-4 w-11/12 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  </div>
                </div>
              </div>

              <LoadingStatusCard tone="rose" rows={0} />

              <LoadingStatusCard tone="emerald" rows={0} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
