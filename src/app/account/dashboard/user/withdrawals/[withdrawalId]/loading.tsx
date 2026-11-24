import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../../_components/dashboardSurfaces";

const skeletonClass = "bg-slate-200/80 dark:bg-white/10";

function LoadingBackLink() {
  return (
    <div className="inline-flex items-center gap-2">
      <Skeleton className={cn("size-4 rounded-full", skeletonClass)} />
      <Skeleton className={cn("h-4 w-32 rounded-full", skeletonClass)} />
    </div>
  );
}

function LoadingReceiptRow() {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-200/70 py-4 last:border-b-0 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="flex items-center gap-2.5">
        <Skeleton className={cn("size-4 rounded-md", skeletonClass)} />
        <Skeleton className={cn("h-3 w-28 rounded-full", skeletonClass)} />
      </div>

      <div className="space-y-2 sm:flex sm:flex-col sm:items-end">
        <Skeleton className={cn("h-4 w-36 rounded-full", skeletonClass)} />
        <Skeleton className={cn("h-3 w-28 rounded-full", skeletonClass)} />
      </div>
    </div>
  );
}

function LoadingSectionHeading() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-28 rounded-full bg-sky-200/80 dark:bg-sky-400/20" />
      <Skeleton className={cn("h-5 w-40 rounded-full", skeletonClass)} />
      <Skeleton
        className={cn("h-3 w-full max-w-64 rounded-full", skeletonClass)}
      />
    </div>
  );
}

function LoadingInformationCard() {
  return (
    <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-4 sm:p-5")}>
      <LoadingSectionHeading />

      <div className="mt-3">
        <LoadingReceiptRow />
        <LoadingReceiptRow />
        <LoadingReceiptRow />
        <LoadingReceiptRow />
      </div>
    </div>
  );
}

function LoadingNetPayout() {
  return (
    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-400/20 dark:bg-emerald-500/[0.08]">
      <Skeleton className="h-3 w-24 rounded-full bg-emerald-200/80 dark:bg-emerald-400/20" />
      <Skeleton className="mt-3 h-8 w-48 rounded-full bg-emerald-200/80 dark:bg-emerald-400/20" />
    </div>
  );
}

function LoadingFinancialCard() {
  return (
    <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "p-4 sm:p-5")}>
      <LoadingSectionHeading />

      <div className="mt-3">
        <LoadingReceiptRow />
        <LoadingReceiptRow />
        <LoadingReceiptRow />
      </div>

      <LoadingNetPayout />
    </div>
  );
}

function LoadingOptionalSection() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-start gap-3">
        <Skeleton className={cn("size-9 shrink-0 rounded-xl", skeletonClass)} />

        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className={cn("h-3 w-28 rounded-full", skeletonClass)} />
          <Skeleton
            className={cn("h-5 w-full max-w-72 rounded-full", skeletonClass)}
          />
          <Skeleton
            className={cn("h-4 w-full max-w-xl rounded-full", skeletonClass)}
          />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="relative mx-auto min-h-[calc(100vh-9rem)] w-full max-w-6xl">
      <div className="absolute inset-x-4 top-8 -z-10 h-40 rounded-[2rem] bg-[#3c9ee0]/10 blur-3xl" />

      <div className="space-y-5 sm:space-y-6">
        <LoadingBackLink />

        <section className={cn(DASHBOARD_PAGE_PANEL_CLASS, "overflow-hidden")}>
          <div className="space-y-6 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col gap-5 border-b border-slate-200/70 pb-6 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-4">
                <Skeleton className="h-7 w-40 rounded-full bg-sky-200/80 dark:bg-sky-400/20" />

                <div className="space-y-3">
                  <Skeleton
                    className={cn("h-4 w-44 rounded-full", skeletonClass)}
                  />
                  <Skeleton
                    className={cn(
                      "h-11 w-full max-w-80 rounded-full",
                      skeletonClass,
                    )}
                  />
                  <Skeleton
                    className={cn(
                      "h-4 w-full max-w-64 rounded-full",
                      skeletonClass,
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2 sm:flex sm:flex-col sm:items-end">
                <Skeleton
                  className={cn("h-8 w-36 rounded-full", skeletonClass)}
                />
                <Skeleton
                  className={cn("h-3 w-32 rounded-full", skeletonClass)}
                />
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <LoadingInformationCard />
              <LoadingFinancialCard />
            </div>

            <LoadingOptionalSection />

            <div className="border-t border-slate-200/70 pt-5 dark:border-white/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2">
                  <Skeleton
                    className={cn("mt-0.5 size-4 rounded-md", skeletonClass)}
                  />
                  <Skeleton
                    className={cn(
                      "h-3 w-full max-w-72 rounded-full",
                      skeletonClass,
                    )}
                  />
                </div>

                <Skeleton
                  className={cn(
                    "h-10 w-full rounded-full sm:w-40",
                    skeletonClass,
                  )}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
