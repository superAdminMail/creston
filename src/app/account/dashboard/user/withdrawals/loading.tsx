import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../_components/dashboardSurfaces";

const SKELETON_CLASS = "bg-slate-200/80 dark:bg-white/10";

function LoadingMethodCard() {
  return (
    <div className="box-border flex min-w-0 w-full items-start justify-between gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Skeleton
          className={cn("mt-0.5 h-4 w-4 shrink-0 rounded-full", SKELETON_CLASS)}
        />

        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton
            className={cn("h-4 w-40 max-w-full rounded-full", SKELETON_CLASS)}
          />
          <Skeleton
            className={cn("h-3 w-24 max-w-full rounded-full", SKELETON_CLASS)}
          />
        </div>
      </div>

      <Skeleton
        className={cn("h-5 w-16 shrink-0 rounded-full", SKELETON_CLASS)}
      />
    </div>
  );
}

function LoadingRequestCard() {
  return (
    <div
      className={cn(
        DASHBOARD_PAGE_SURFACE_CLASS,
        "box-border block h-full min-w-0 w-full space-y-4 overflow-hidden p-4 transition-colors duration-200",
      )}
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton
            className={cn("h-5 w-36 max-w-full rounded-full", SKELETON_CLASS)}
          />
          <Skeleton
            className={cn("h-4 w-48 max-w-full rounded-full", SKELETON_CLASS)}
          />
        </div>

        <Skeleton
          className={cn("h-5 w-5 shrink-0 rounded-full", SKELETON_CLASS)}
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          className={cn(
            DASHBOARD_PAGE_SURFACE_CLASS,
            "min-w-0 overflow-hidden p-3",
          )}
        >
          <Skeleton
            className={cn("h-3 w-20 max-w-full rounded-full", SKELETON_CLASS)}
          />
          <Skeleton
            className={cn(
              "mt-2 h-4 w-28 max-w-full rounded-full",
              SKELETON_CLASS,
            )}
          />
          <Skeleton
            className={cn(
              "mt-2 h-3 w-24 max-w-full rounded-full",
              SKELETON_CLASS,
            )}
          />
        </div>

        <div
          className={cn(
            DASHBOARD_PAGE_SURFACE_CLASS,
            "min-w-0 overflow-hidden p-3",
          )}
        >
          <Skeleton
            className={cn("h-3 w-20 max-w-full rounded-full", SKELETON_CLASS)}
          />
          <Skeleton
            className={cn(
              "mt-2 h-4 w-28 max-w-full rounded-full",
              SKELETON_CLASS,
            )}
          />
        </div>
      </div>

      <div
        className={cn(
          DASHBOARD_PAGE_SURFACE_CLASS,
          "min-w-0 overflow-hidden p-3",
        )}
      >
        <Skeleton
          className={cn("h-3 w-28 max-w-full rounded-full", SKELETON_CLASS)}
        />
        <Skeleton
          className={cn("mt-2 h-4 w-full rounded-full", SKELETON_CLASS)}
        />
        <Skeleton
          className={cn(
            "mt-2 h-4 w-10/12 max-w-full rounded-full",
            SKELETON_CLASS,
          )}
        />
      </div>

      <Skeleton className={cn("h-20 w-full rounded-2xl", SKELETON_CLASS)} />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-6 overflow-x-clip px-4 py-4 sm:px-6 sm:py-6">
      <div className="min-w-0 space-y-2">
        <Skeleton
          className={cn("h-8 w-full max-w-48 rounded-full", SKELETON_CLASS)}
        />
        <Skeleton
          className={cn("h-4 w-full max-w-80 rounded-full", SKELETON_CLASS)}
        />
      </div>

      <div
        className={cn(
          DASHBOARD_PAGE_PANEL_CLASS,
          "box-border min-w-0 w-full space-y-2 overflow-hidden p-4 sm:p-6",
        )}
      >
        <Skeleton
          className={cn("h-4 w-28 max-w-full rounded-full", SKELETON_CLASS)}
        />
        <Skeleton
          className={cn("h-10 w-full max-w-56 rounded-full", SKELETON_CLASS)}
        />
        <Skeleton
          className={cn("h-4 w-full max-w-72 rounded-full", SKELETON_CLASS)}
        />
      </div>

      <div
        className={cn(
          DASHBOARD_PAGE_PANEL_CLASS,
          "box-border min-w-0 w-full space-y-6 overflow-hidden p-4 sm:p-6",
        )}
      >
        <div className="min-w-0 space-y-2">
          <Skeleton
            className={cn("h-5 w-48 max-w-full rounded-full", SKELETON_CLASS)}
          />
          <Skeleton
            className={cn("h-4 w-full max-w-72 rounded-full", SKELETON_CLASS)}
          />
        </div>

        <div className="min-w-0 space-y-2">
          <Skeleton
            className={cn("h-3 w-16 max-w-full rounded-full", SKELETON_CLASS)}
          />
          <Skeleton className={cn("h-11 w-full rounded-2xl", SKELETON_CLASS)} />
          <Skeleton
            className={cn("h-3 w-44 max-w-full rounded-full", SKELETON_CLASS)}
          />
        </div>

        <div className="min-w-0 space-y-3">
          <Skeleton
            className={cn("h-3 w-40 max-w-full rounded-full", SKELETON_CLASS)}
          />

          <div className="grid min-w-0 grid-cols-1 gap-3">
            <LoadingMethodCard />
            <LoadingMethodCard />
          </div>
        </div>

        <Skeleton
          className={cn(
            "block h-12 w-full max-w-full rounded-2xl",
            SKELETON_CLASS,
          )}
        />
      </div>

      <div
        className={cn(
          DASHBOARD_PAGE_SURFACE_CLASS,
          "box-border min-w-0 w-full space-y-4 overflow-hidden p-4 sm:p-5",
        )}
      >
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <Skeleton
              className={cn("h-4 w-36 max-w-full rounded-full", SKELETON_CLASS)}
            />
            <Skeleton
              className={cn("h-3 w-full max-w-72 rounded-full", SKELETON_CLASS)}
            />
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <LoadingRequestCard />
          <LoadingRequestCard />
          <LoadingRequestCard />
        </div>
      </div>
    </div>
  );
}
