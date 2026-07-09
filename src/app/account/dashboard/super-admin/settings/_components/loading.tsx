import { Skeleton } from "@/components/ui/skeleton";

import { DASHBOARD_PAGE_PANEL_CLASS } from "../../../_components/dashboardSurfaces";

export default function SiteSettingsLoading() {
  return (
    <div className="space-y-8">
      <section className={DASHBOARD_PAGE_PANEL_CLASS + " overflow-hidden p-6 md:p-8"}>
        <div className="space-y-4">
          <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
          <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-white/10" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <section
              key={index}
              className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:bg-white/[0.04] sm:p-6"
            >
              <Skeleton className="h-6 w-40 rounded-xl bg-white/10" />
              <Skeleton className="mt-2 h-4 w-full max-w-md rounded-xl bg-white/10" />
              <div className="mt-6 space-y-4">
                <Skeleton className="h-11 w-full rounded-xl bg-white/10" />
                <Skeleton className="h-11 w-full rounded-xl bg-white/10" />
                <Skeleton className="h-28 w-full rounded-2xl bg-white/10" />
              </div>
            </section>
          ))}
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:bg-white/[0.04] sm:p-6">
            <Skeleton className="h-6 w-36 rounded-xl bg-white/10" />
            <Skeleton className="mt-2 h-4 w-full rounded-xl bg-white/10" />
            <Skeleton className="mt-6 h-11 w-full rounded-xl bg-white/10" />
            <Skeleton className="mt-4 h-28 w-full rounded-2xl bg-white/10" />
          </section>
          <section className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:bg-white/[0.04] sm:p-6">
            <Skeleton className="h-6 w-40 rounded-xl bg-white/10" />
            <Skeleton className="mt-2 h-4 w-full rounded-xl bg-white/10" />
            <Skeleton className="mt-6 h-24 w-full rounded-2xl bg-white/10" />
          </section>
        </div>
      </div>
    </div>
  );
}
