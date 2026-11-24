import { Skeleton } from "@/components/ui/skeleton";

const SURFACE =
  "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900";

function MetricSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <Skeleton className="h-3.5 w-24 rounded-full" />
      <Skeleton className="mt-3 h-6 w-28 max-w-full rounded-lg" />
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className={SURFACE}>
      <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-7 w-32 max-w-full rounded-lg" />
          <Skeleton className="h-3.5 w-full max-w-40 rounded-full" />
        </div>
        <Skeleton className="size-10 shrink-0 rounded-xl" />
      </div>
    </div>
  );
}

function AssetSkeleton() {
  return (
    <div className={`${SURFACE} space-y-5 p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-36 max-w-full rounded-full" />
          <Skeleton className="h-3.5 w-44 max-w-full rounded-full" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-3.5 w-24 rounded-full" />
        <Skeleton className="h-8 w-40 max-w-full rounded-lg" />
        <Skeleton className="h-3.5 w-32 rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="mt-3 h-5 w-28 max-w-full rounded-full" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="mt-3 h-5 w-20 rounded-full" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-white/10">
        <Skeleton className="h-3.5 w-20 rounded-full" />
        <Skeleton className="h-3.5 w-16 rounded-full" />
        <Skeleton className="h-3.5 w-14 rounded-full" />
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <Skeleton className="size-10 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-40 max-w-full rounded-full" />
          <Skeleton className="h-3.5 w-52 max-w-full rounded-full" />
          <Skeleton className="h-3 w-36 max-w-full rounded-full" />
        </div>
      </div>
      <Skeleton className="h-5 w-24 rounded-full" />
    </div>
  );
}

function SectionHeadingSkeleton({
  description = true,
}: {
  description?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-28 rounded-full" />
      <Skeleton className="h-6 w-48 max-w-full rounded-lg" />
      {description ? (
        <Skeleton className="h-4 w-full max-w-lg rounded-full" />
      ) : null}
    </div>
  );
}

function RewardSkeleton() {
  return (
    <section className={`${SURFACE} space-y-5 p-5 sm:p-6`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-6 w-44 rounded-lg" />
          <Skeleton className="h-4 w-full max-w-xl rounded-full" />
        </div>
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-3">
          <Skeleton className="h-6 w-44 rounded-full" />
          <Skeleton className="h-8 w-72 max-w-full rounded-lg sm:h-9" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
        </div>

        <div className="grid h-12 w-full grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-slate-900 sm:w-80">
          <Skeleton className="h-full rounded-lg" />
          <Skeleton className="h-full rounded-lg" />
        </div>
      </div>

      <section
        className={`${SURFACE} overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-5 dark:bg-slate-900 sm:p-7`}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-end">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-10 w-56 max-w-full rounded-lg" />
            <Skeleton className="h-7 w-40 rounded-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <MetricSkeleton key={index} />
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5 dark:border-white/10">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-32 rounded-full" />
            <Skeleton className="h-6 w-36 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-36 rounded-full" />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeadingSkeleton />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <AssetSkeleton key={index} />
          ))}
        </div>
      </section>

      <section className={`${SURFACE} space-y-5 p-5 sm:p-6`}>
        <div className="space-y-2">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <Skeleton className="h-4 w-full max-w-xl rounded-full" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <ActivitySkeleton key={index} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeadingSkeleton />

        <div className="grid gap-6">
          <RewardSkeleton />
          <RewardSkeleton />
        </div>
      </section>
    </div>
  );
}
