import { ShieldCheck } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { DashboardSectionCard } from "../_components/DashboardSectionCard";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "../_components/dashboardSurfaces";

function LoadingSecurityItem() {
  return (
    <div
      className={cn(
        DASHBOARD_PAGE_SURFACE_CLASS,
        "p-4 transition-colors duration-200",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-4 w-full max-w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-4 w-full max-w-56 rounded-full bg-slate-200/80 dark:bg-white/10" />
          </div>
        </div>

        <Skeleton className="h-11 w-full max-w-36 rounded-xl bg-slate-200/80 dark:bg-white/10" />
      </div>
    </div>
  );
}

function LoadingPanelCard({
  titleWidth,
  lineWidths,
}: {
  titleWidth: string;
  lineWidths: [string, string];
}) {
  return (
    <DashboardSectionCard className="space-y-4 p-5 sm:p-6">
      <div className="space-y-2">
        <Skeleton
          className={cn(
            "h-5 rounded-full bg-slate-200/80 dark:bg-white/10",
            `w-full ${titleWidth}`,
          )}
        />
        <Skeleton
          className={cn(
            "h-4 rounded-full bg-slate-200/80 dark:bg-white/10",
            `w-full ${lineWidths[0]}`,
          )}
        />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-16 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="h-16 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
      </div>

      <div className="rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm dark:bg-white/[0.04]">
        <Skeleton
          className={cn(
            "h-4 rounded-full bg-slate-200/80 dark:bg-white/10",
            `w-full ${lineWidths[1]}`,
          )}
        />
      </div>
    </DashboardSectionCard>
  );
}

export default function Loading() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="space-y-4">
        <Skeleton className="h-8 w-full max-w-64 rounded-full bg-slate-200/80 dark:bg-white/10 sm:h-10 sm:max-w-80" />

        <div className="space-y-3">
          <Skeleton className="h-8 w-full max-w-64 rounded-full bg-slate-200/80 dark:bg-white/10 sm:h-10 sm:max-w-80" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <DashboardSectionCard className="space-y-4 p-5 sm:p-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-4 w-full max-w-md rounded-full bg-slate-200/80 dark:bg-white/10" />
          </div>

          <div className="space-y-4">
            <LoadingSecurityItem />
            <LoadingSecurityItem />
            <LoadingSecurityItem />
          </div>
        </DashboardSectionCard>

        <div className="space-y-6">
          <LoadingPanelCard titleWidth="w-36" lineWidths={["w-72", "w-44"]} />
          <LoadingPanelCard titleWidth="w-32" lineWidths={["w-56", "w-36"]} />
        </div>
      </div>
    </div>
  );
}
