import { Skeleton } from "@/components/ui/skeleton";

import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../../_components/dashboardSurfaces";

export default function Loading() {
  return (
    <div className="space-y-8">
      <section className={DASHBOARD_PAGE_PANEL_CLASS + " overflow-hidden p-6 md:p-8"}>
        <div className="space-y-4">
          <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
          <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-white/10" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-5 sm:p-6"}>
          <Skeleton className="h-6 w-44 rounded-full bg-white/10" />
          <Skeleton className="mt-3 h-4 w-full max-w-2xl rounded-full bg-white/10" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-2xl bg-white/10" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-5 sm:p-6"}>
            <Skeleton className="h-6 w-36 rounded-full bg-white/10" />
            <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
            <div className="mt-6 space-y-3">
              <Skeleton className="h-11 w-full rounded-2xl bg-white/10" />
              <Skeleton className="h-11 w-full rounded-2xl bg-white/10" />
            </div>
          </div>

          <div className={DASHBOARD_PAGE_SURFACE_CLASS + " p-5 sm:p-6"}>
            <Skeleton className="h-6 w-32 rounded-full bg-white/10" />
            <div className="mt-4 grid gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-11 rounded-2xl bg-white/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
