import { cn } from "@/lib/utils";
import { DashboardSectionCard } from "./DashboardSectionCard";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "./dashboardSurfaces";
import { Skeleton } from "@/components/ui/skeleton";

type SupportLoadingShellProps = {
  titleWidthClass: string;
  variant?: "support" | "conversation";
};

export function SupportLoadingShell({
  titleWidthClass,
  variant = "support",
}: SupportLoadingShellProps) {
  const isConversationVariant = variant === "conversation";

  return (
    <div
      className={cn(
        "mx-auto min-h-[calc(100dvh-7rem)] px-4 py-4 sm:px-6 lg:px-8",
        "max-w-7xl",
      )}
    >
      <div className="space-y-6">
        {isConversationVariant ? (
          <>
            <DashboardSectionCard
              className={DASHBOARD_PAGE_PANEL_CLASS + " p-5 sm:p-6"}
            >
              <Skeleton
                className={cn(
                  "h-4 rounded-full bg-slate-200/80 dark:bg-white/10",
                  titleWidthClass,
                )}
              />
              <Skeleton className="mt-4 h-8 w-3/4 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="mt-3 h-4 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
            </DashboardSectionCard>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-5"}>
                <Skeleton className="h-[32rem] rounded-[1.5rem] bg-slate-200/60 dark:bg-white/5" />
              </div>
              <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-5"}>
                <Skeleton className="h-[32rem] rounded-[1.5rem] bg-slate-200/60 dark:bg-white/5" />
              </div>
            </div>
          </>
        ) : (
          <>
            <DashboardSectionCard
              className={DASHBOARD_PAGE_PANEL_CLASS + " rounded-[2rem] p-6 sm:p-8"}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                  <Skeleton
                    className={cn(
                      "h-8 rounded-full bg-slate-200/80 dark:bg-white/10",
                      titleWidthClass,
                    )}
                  />
                  <Skeleton className="h-10 w-full max-w-md rounded-2xl bg-slate-200/80 dark:bg-white/10" />
                  <Skeleton className="h-5 w-full max-w-3xl rounded-full bg-slate-200/80 dark:bg-white/10" />
                </div>
              </div>
            </DashboardSectionCard>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "overflow-hidden rounded-[1.9rem]")}>
                <div className="space-y-4 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Skeleton className="h-4 w-4 rounded-full bg-slate-200/80 dark:bg-white/10" />
                    <Skeleton className="h-4 w-16 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  </div>

                  <div className="space-y-3">
                    <Skeleton className="h-11 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-10 flex-1 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
                      <Skeleton className="h-10 w-10 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="h-8 w-20 rounded-full bg-slate-200/80 dark:bg-white/10"
                      />
                    ))}
                  </div>

                  <div className="h-px bg-slate-200/80 dark:bg-white/10" />

                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-4 w-full max-w-md rounded-full bg-slate-200/80 dark:bg-white/10" />
                            <Skeleton className="h-3.5 w-56 rounded-full bg-slate-200/80 dark:bg-white/10" />
                          </div>
                          <Skeleton className="h-6 w-20 rounded-full bg-slate-200/80 dark:bg-white/10" />
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <Skeleton className="h-3.5 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
                          <Skeleton className="h-3.5 w-20 rounded-full bg-slate-200/80 dark:bg-white/10" />
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <Skeleton className="h-3.5 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
                          <Skeleton className="h-3.5 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "rounded-[1.9rem]")}>
                <div className="space-y-5 p-5">
                  <div>
                    <Skeleton className="h-3.5 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
                    <Skeleton className="mt-2 h-5 w-44 rounded-full bg-slate-200/80 dark:bg-white/10" />
                    <Skeleton className="mt-2 h-4 w-full max-w-xs rounded-full bg-slate-200/80 dark:bg-white/10" />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]"
                      >
                        <Skeleton className="h-3.5 w-20 rounded-full bg-slate-200/80 dark:bg-white/10" />
                        <Skeleton className="mt-2 h-8 w-16 rounded-full bg-slate-200/80 dark:bg-white/10" />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <Skeleton className="h-4 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
                    <div className="mt-3 space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex gap-3">
                          <Skeleton className="mt-0.5 h-6 w-6 rounded-full bg-slate-200/80 dark:bg-white/10" />
                          <Skeleton className="h-4 flex-1 rounded-full bg-slate-200/80 dark:bg-white/10" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
