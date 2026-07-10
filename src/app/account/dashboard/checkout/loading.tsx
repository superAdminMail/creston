import { Skeleton } from "@/components/ui/skeleton";

import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../_components/dashboardSurfaces";

export default function Loading() {
  return (
    <div className="mx-auto min-h-[calc(100dvh-7rem)] max-w-6xl px-4 py-6 md:px-6">
      <div className="space-y-6">
        <section className={`${DASHBOARD_PAGE_PANEL_CLASS} p-4 sm:p-6`}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-5 w-40 rounded-full" />
                <Skeleton className="h-4 w-64 max-w-full rounded-full" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Skeleton className={`h-16 rounded-[1.35rem] ${DASHBOARD_PAGE_SURFACE_CLASS}`} />
              <Skeleton className={`h-16 rounded-[1.35rem] ${DASHBOARD_PAGE_SURFACE_CLASS}`} />
              <Skeleton className={`h-16 rounded-[1.35rem] ${DASHBOARD_PAGE_SURFACE_CLASS}`} />
              <Skeleton className={`h-16 rounded-[1.35rem] ${DASHBOARD_PAGE_SURFACE_CLASS}`} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <div className={`${DASHBOARD_PAGE_PANEL_CLASS} p-4 sm:p-6`}>
              <Skeleton className="h-5 w-36 rounded-full" />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Skeleton className={`h-24 rounded-[1.35rem] ${DASHBOARD_PAGE_SURFACE_CLASS}`} />
                <Skeleton className={`h-24 rounded-[1.35rem] ${DASHBOARD_PAGE_SURFACE_CLASS}`} />
                <Skeleton className={`h-24 rounded-[1.35rem] ${DASHBOARD_PAGE_SURFACE_CLASS}`} />
                <Skeleton className={`h-24 rounded-[1.35rem] ${DASHBOARD_PAGE_SURFACE_CLASS}`} />
              </div>
            </div>

            <div className={`${DASHBOARD_PAGE_PANEL_CLASS} p-4 sm:p-6`}>
              <Skeleton className="h-5 w-44 rounded-full" />
              <div className="mt-5 space-y-3">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-11/12 rounded-full" />
                <Skeleton className="h-4 w-10/12 rounded-full" />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Skeleton className={`h-12 rounded-[1.15rem] ${DASHBOARD_PAGE_SURFACE_CLASS}`} />
                <Skeleton className={`h-12 rounded-[1.15rem] ${DASHBOARD_PAGE_SURFACE_CLASS}`} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`${DASHBOARD_PAGE_PANEL_CLASS} p-4 sm:p-6`}>
              <Skeleton className="h-5 w-28 rounded-full" />
              <div className="mt-5 space-y-3">
                <Skeleton className={`h-12 rounded-[1.15rem] ${DASHBOARD_PAGE_SURFACE_CLASS}`} />
                <Skeleton className={`h-12 rounded-[1.15rem] ${DASHBOARD_PAGE_SURFACE_CLASS}`} />
                <Skeleton className={`h-12 rounded-[1.15rem] ${DASHBOARD_PAGE_SURFACE_CLASS}`} />
              </div>
            </div>

            <div className={`${DASHBOARD_PAGE_PANEL_CLASS} p-4 sm:p-6`}>
              <Skeleton className="h-5 w-32 rounded-full" />
              <div className="mt-5 space-y-3">
                <Skeleton className={`h-10 w-full rounded-[1.15rem] ${DASHBOARD_PAGE_SURFACE_CLASS}`} />
                <Skeleton className={`h-10 w-full rounded-[1.15rem] ${DASHBOARD_PAGE_SURFACE_CLASS}`} />
                <Skeleton className={`h-10 w-3/4 rounded-[1.15rem] ${DASHBOARD_PAGE_SURFACE_CLASS}`} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
