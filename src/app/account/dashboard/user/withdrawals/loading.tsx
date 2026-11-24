import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../_components/dashboardSurfaces";

const SKELETON_CLASS = "bg-slate-200/80 dark:bg-white/10";

function LoadingHeading() {
  return (
    <div className="space-y-2">
      <Skeleton className={cn("h-8 w-48 rounded-full", SKELETON_CLASS)} />
      <Skeleton
        className={cn("h-4 w-full max-w-80 rounded-full", SKELETON_CLASS)}
      />
    </div>
  );
}

function LoadingBalanceCard() {
  return (
    <section
      className={cn(
        DASHBOARD_PAGE_PANEL_CLASS,
        "relative min-w-0 overflow-hidden p-4 sm:p-6",
      )}
    >
      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className={cn("h-3 w-36 rounded-full", SKELETON_CLASS)} />
            <Skeleton
              className={cn("h-9 w-48 max-w-full rounded-full", SKELETON_CLASS)}
            />
          </div>

          <Skeleton
            className={cn("size-11 shrink-0 rounded-2xl", SKELETON_CLASS)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200/70 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <Skeleton
                className={cn("h-3 w-28 rounded-full", SKELETON_CLASS)}
              />
              <Skeleton
                className={cn(
                  "mt-3 h-5 w-32 max-w-full rounded-full",
                  SKELETON_CLASS,
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LoadingMethodCard() {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white/70 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton
          className={cn("size-9 shrink-0 rounded-xl", SKELETON_CLASS)}
        />
        <div className="min-w-0 space-y-2">
          <Skeleton
            className={cn("h-4 w-36 max-w-full rounded-full", SKELETON_CLASS)}
          />
          <Skeleton
            className={cn("h-3 w-24 max-w-full rounded-full", SKELETON_CLASS)}
          />
        </div>
      </div>
      <Skeleton
        className={cn("size-5 shrink-0 rounded-full", SKELETON_CLASS)}
      />
    </div>
  );
}

function LoadingSourceCard() {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton
            className={cn("size-9 shrink-0 rounded-xl", SKELETON_CLASS)}
          />
          <div className="min-w-0 space-y-2">
            <Skeleton
              className={cn("h-4 w-28 max-w-full rounded-full", SKELETON_CLASS)}
            />
            <Skeleton
              className={cn("h-3 w-24 max-w-full rounded-full", SKELETON_CLASS)}
            />
          </div>
        </div>
        <Skeleton
          className={cn("size-5 shrink-0 rounded-full", SKELETON_CLASS)}
        />
      </div>

      <Skeleton
        className={cn("mt-4 h-5 w-32 max-w-full rounded-full", SKELETON_CLASS)}
      />
    </div>
  );
}

function LoadingWithdrawalForm() {
  return (
    <section
      className={cn(
        DASHBOARD_PAGE_PANEL_CLASS,
        "min-w-0 space-y-6 overflow-hidden p-4 sm:p-6",
      )}
    >
      <div className="space-y-2">
        <Skeleton className={cn("h-5 w-48 rounded-full", SKELETON_CLASS)} />
        <Skeleton
          className={cn("h-4 w-full max-w-80 rounded-full", SKELETON_CLASS)}
        />
      </div>

      <div className="space-y-3">
        <Skeleton className={cn("h-3 w-20 rounded-full", SKELETON_CLASS)} />

        <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <Skeleton className={cn("size-5 rounded-md", SKELETON_CLASS)} />
          <Skeleton className={cn("h-5 w-full rounded-full", SKELETON_CLASS)} />
        </div>

        <Skeleton
          className={cn("h-3 w-44 max-w-full rounded-full", SKELETON_CLASS)}
        />
      </div>

      <div className="space-y-3">
        <Skeleton className={cn("h-3 w-36 rounded-full", SKELETON_CLASS)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <LoadingMethodCard />
          <LoadingMethodCard />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className={cn("h-3 w-32 rounded-full", SKELETON_CLASS)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <LoadingSourceCard />
          <LoadingSourceCard />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className={cn("h-3 w-28 rounded-full", SKELETON_CLASS)} />
          <Skeleton className={cn("h-4 w-24 rounded-full", SKELETON_CLASS)} />
        </div>
        <Skeleton
          className={cn(
            "mt-3 h-3 w-full max-w-72 rounded-full",
            SKELETON_CLASS,
          )}
        />
      </div>

      <Skeleton className={cn("h-12 w-full rounded-full", SKELETON_CLASS)} />
    </section>
  );
}

function LoadingWithdrawalRequestCard() {
  return (
    <div
      className={cn(
        DASHBOARD_PAGE_SURFACE_CLASS,
        "min-w-0 space-y-4 overflow-hidden p-4 sm:p-5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton
            className={cn("h-4 w-36 max-w-full rounded-full", SKELETON_CLASS)}
          />
          <Skeleton
            className={cn("h-3 w-48 max-w-full rounded-full", SKELETON_CLASS)}
          />
        </div>
        <Skeleton
          className={cn("h-6 w-20 shrink-0 rounded-full", SKELETON_CLASS)}
        />
      </div>

      <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
        <Skeleton className={cn("h-3 w-24 rounded-full", SKELETON_CLASS)} />
        <Skeleton
          className={cn(
            "mt-2 h-6 w-40 max-w-full rounded-full",
            SKELETON_CLASS,
          )}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className={cn("h-3 w-24 rounded-full", SKELETON_CLASS)} />
          <Skeleton
            className={cn("h-4 w-32 max-w-full rounded-full", SKELETON_CLASS)}
          />
        </div>
        <div className="space-y-2">
          <Skeleton className={cn("h-3 w-24 rounded-full", SKELETON_CLASS)} />
          <Skeleton
            className={cn("h-4 w-32 max-w-full rounded-full", SKELETON_CLASS)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3 dark:border-white/10">
        <Skeleton className={cn("h-3 w-28 rounded-full", SKELETON_CLASS)} />
        <Skeleton className={cn("h-9 w-28 rounded-full", SKELETON_CLASS)} />
      </div>
    </div>
  );
}

function LoadingWithdrawalHistory() {
  return (
    <section
      className={cn(
        DASHBOARD_PAGE_SURFACE_CLASS,
        "min-w-0 space-y-5 overflow-hidden p-4 sm:p-5",
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className={cn("h-5 w-40 rounded-full", SKELETON_CLASS)} />
          <Skeleton
            className={cn("h-3 w-full max-w-72 rounded-full", SKELETON_CLASS)}
          />
        </div>
        <Skeleton
          className={cn("h-9 w-full rounded-full sm:w-32", SKELETON_CLASS)}
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <LoadingWithdrawalRequestCard />
        <LoadingWithdrawalRequestCard />
        <LoadingWithdrawalRequestCard />
      </div>
    </section>
  );
}

export default function Loading() {
  return (
    <div className="relative mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6 overflow-x-clip px-4 py-4 sm:px-6 sm:py-6">
      <LoadingHeading />

      <LoadingBalanceCard />

      <LoadingWithdrawalForm />

      <LoadingWithdrawalHistory />
    </div>
  );
}
