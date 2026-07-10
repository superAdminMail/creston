import { Skeleton } from "@/components/ui/skeleton";

import { DASHBOARD_PAGE_PANEL_CLASS } from "../../../_components/dashboardSurfaces";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-2xl items-center px-4 py-10 md:px-6">
      <div className={`${DASHBOARD_PAGE_PANEL_CLASS} w-full p-6`}>
        <Skeleton className="h-8 w-36 rounded-full" />
        <div className="mt-5 space-y-3">
          <Skeleton className="h-5 w-3/4 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-11/12 rounded-full" />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-20 rounded-[1.35rem]" />
          <Skeleton className="h-20 rounded-[1.35rem]" />
        </div>

        <div className="mt-6 flex gap-3">
          <Skeleton className="h-11 w-40 rounded-full" />
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>
      </div>
    </main>
  );
}
