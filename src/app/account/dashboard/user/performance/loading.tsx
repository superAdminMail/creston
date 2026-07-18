import { Skeleton } from "@/components/ui/skeleton";

function MetricSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-4 w-24 rounded-full bg-white/10" />
          <Skeleton className="h-8 w-28 rounded-2xl bg-white/10" />
          <Skeleton className="h-4 w-full rounded-full bg-white/10" />
        </div>
        <Skeleton className="h-10 w-10 rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <Skeleton className="h-4 w-40 rounded-full bg-white/10" />
      <Skeleton className="mt-2 h-5 w-full max-w-2xl rounded-full bg-white/10" />
      <Skeleton className="mt-6 h-[300px] rounded-[1.5rem] bg-white/10" />
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="rounded-[1.4rem] border border-border/60 bg-white/75 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-4 w-44 rounded-full bg-white/10" />
          <Skeleton className="h-3.5 w-36 rounded-full bg-white/10" />
          <Skeleton className="h-3.5 w-52 rounded-full bg-white/10" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-7 w-44 rounded-full bg-white/10" />
          <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-white/10" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
        </div>

        <Skeleton className="h-12 w-full max-w-[22rem] rounded-[1.5rem] bg-white/10" />
      </div>

      <div className="space-y-6">
        <div className="rounded-[1.9rem] border border-border/60 bg-white/75 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
              <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-white/10" />
              <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <MetricSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
            <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <MetricSkeleton key={index} />
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
            <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <ActivitySkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
