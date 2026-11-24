import { Skeleton } from "@/components/ui/skeleton";

const SURFACE =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6";

function AccountCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-6 w-48 max-w-full rounded-lg" />
          <Skeleton className="h-4 w-36 max-w-full rounded-full" />
          <Skeleton className="h-4 w-full max-w-xl rounded-full" />
        </div>

        <Skeleton className="h-7 w-24 shrink-0 rounded-full" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-4 w-32 max-w-full rounded-full" />
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5 dark:border-white/10">
        <Skeleton className="h-10 w-36 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}

function OverviewMetricSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>

      <Skeleton className="mt-4 h-7 w-24 max-w-full rounded-lg" />
      <Skeleton className="mt-3 h-3 w-28 max-w-full rounded-full" />
    </div>
  );
}

function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className={SURFACE}>
      <Skeleton className="h-3 w-32 rounded-full" />
      <Skeleton className="mt-3 h-6 w-48 max-w-full rounded-lg" />
      <Skeleton className="mt-3 h-4 w-full max-w-sm rounded-full" />

      <div className="mt-6 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <Skeleton className="h-4 w-36 max-w-full rounded-full" />
            <Skeleton className="mt-3 h-3 w-full rounded-full" />
            <Skeleton className="mt-2 h-3 w-4/5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-3 w-32 rounded-full" />
          <Skeleton className="h-9 w-72 max-w-full rounded-xl" />
          <Skeleton className="h-4 w-full max-w-xl rounded-full" />
        </div>

        <Skeleton className="h-11 w-40 shrink-0 rounded-xl" />
      </div>

      <section className={SURFACE}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-3 w-28 rounded-full" />
            <Skeleton className="h-7 w-56 max-w-full rounded-lg" />
            <Skeleton className="h-4 w-full max-w-lg rounded-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[42rem] xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <OverviewMetricSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="min-w-0 space-y-6">
          <div className={SURFACE}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <Skeleton className="h-3 w-32 rounded-full" />
                <Skeleton className="h-7 w-56 max-w-full rounded-lg" />
                <Skeleton className="h-4 w-full max-w-md rounded-full" />
              </div>

              <Skeleton className="h-8 w-24 rounded-full" />
            </div>

            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <AccountCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>

        <aside className="min-w-0 space-y-6">
          <PanelSkeleton rows={3} />

          <div className={SURFACE}>
            <Skeleton className="h-3 w-36 rounded-full" />

            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
