import { Skeleton } from "@/components/ui/skeleton";

import { DashboardSectionCard } from "../../_components/DashboardSectionCard";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
  DASHBOARD_TABLE_SHELL_CLASS,
} from "../../_components/dashboardSurfaces";

export default function Loading() {
  return (
    <div className="space-y-8">
      <DashboardSectionCard>
        <div className="space-y-4">
          <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
          <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-white/10" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
        </div>
      </DashboardSectionCard>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4"}>
            <Skeleton className="h-3 w-20 rounded-full bg-white/10" />
            <Skeleton className="mt-3 h-8 w-24 rounded-2xl bg-white/10" />
            <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className={DASHBOARD_PAGE_PANEL_CLASS + " p-5 sm:p-6"}>
          <Skeleton className="h-6 w-44 rounded-full bg-white/10" />
          <Skeleton className="mt-3 h-4 w-full max-w-2xl rounded-full bg-white/10" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={DASHBOARD_PAGE_SURFACE_CLASS + " p-4"}
              >
                <Skeleton className="h-5 w-44 rounded-full bg-white/10" />
                <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        </div>

        <div className={DASHBOARD_PAGE_PANEL_CLASS + " p-5 sm:p-6"}>
          <Skeleton className="h-6 w-40 rounded-full bg-white/10" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl rounded-full bg-white/10" />
          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-border/60 bg-white/75 shadow-sm dark:bg-white/[0.04]">
            <div className={DASHBOARD_TABLE_SHELL_CLASS + " overflow-hidden"}>
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full">
                  <thead>
                    <tr className="border-b border-border/60 dark:border-white/10">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <th key={index} className="px-4 py-4">
                          <Skeleton className="h-3 w-20 rounded-full bg-white/10" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }).map((_, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-border/60 last:border-b-0 dark:border-white/10"
                      >
                        {Array.from({ length: 4 }).map((__, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-4">
                            <Skeleton className="h-4 w-full max-w-32 rounded-full bg-white/10" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
