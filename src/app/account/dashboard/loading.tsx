import { Skeleton } from "@/components/ui/skeleton";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "./_components/dashboardSurfaces";

const pageShellClassName = "space-y-8";
const cardClassName = `${DASHBOARD_PAGE_SURFACE_CLASS} p-6`;

function DashboardHeaderSkeleton() {
  return (
    <section className="space-y-3">
      <div className={DASHBOARD_PAGE_SURFACE_CLASS + " overflow-hidden p-6 md:p-8"}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Skeleton className="h-6 w-28 rounded-full" />

            <div className="space-y-2">
              <Skeleton className="h-10 w-full max-w-72 rounded-full" />
              <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
    </section>
  );
}

function DashboardBodySkeleton() {
  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="space-y-6 xl:col-span-8">
        <section className="space-y-3">
          <div className="space-y-1">
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={`quick-${index}`} className={cardClassName}>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded-full" />
                  <Skeleton className="h-4 w-48 rounded-full" />
                </div>
                <Skeleton className="mt-6 h-4 w-10 rounded-full" />
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className={cardClassName}>
            <Skeleton className="h-5 w-36 rounded-full" />
            <Skeleton className="mt-2 h-4 w-full max-w-2xl rounded-full" />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`spot-${index}`} className={DASHBOARD_PAGE_SURFACE_CLASS + " p-5"}>
                  <Skeleton className="h-10 w-10 rounded-2xl" />
                  <Skeleton className="mt-4 h-4 w-28 rounded-full" />
                  <Skeleton className="mt-2 h-4 w-full max-w-48 rounded-full" />
                  <Skeleton className="mt-5 h-8 w-24 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className={cardClassName}>
            <Skeleton className="h-5 w-40 rounded-full" />
            <Skeleton className="mt-2 h-4 w-full max-w-2xl rounded-full" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`activity-${index}`}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm dark:bg-white/[0.04]"
                >
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36 rounded-full" />
                      <Skeleton className="h-4 w-full max-w-72 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-6 xl:col-span-4">
        <section>
          <div className={cardClassName}>
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="mt-2 h-4 w-full max-w-64 rounded-full" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`status-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-white/75 px-4 py-3 shadow-sm dark:bg-white/[0.04]"
                >
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-7 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className={cardClassName}>
            <Skeleton className="h-5 w-36 rounded-full" />
            <Skeleton className="mt-2 h-4 w-full max-w-64 rounded-full" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`module-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-white/75 px-4 py-3 shadow-sm dark:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-4 w-32 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className={DASHBOARD_PAGE_SURFACE_CLASS + " overflow-hidden"}>
            <div className="space-y-4 p-5">
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="h-6 w-full max-w-56 rounded-full" />
              <Skeleton className="h-4 w-full max-w-80 rounded-full" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export default function DashboardLoading() {
  return (
    <div className={pageShellClassName}>
      <DashboardHeaderSkeleton />
      <DashboardBodySkeleton />
    </div>
  );
}
