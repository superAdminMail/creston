import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
      <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="mt-3 h-8 w-20 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="mt-3 h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
    </div>
  );
}

function MethodCardSkeleton() {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-44 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-3.5 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-24 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-24 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 lg:w-[220px] lg:flex-col">
          <Skeleton className="h-11 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-11 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-11 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="relative mx-auto w-full max-w-7xl">
      <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-col gap-5 border-b border-slate-200/80 pb-6 lg:flex-row lg:items-end lg:justify-between dark:border-white/10">
          <div className="max-w-2xl space-y-3">
            <Skeleton className="h-4 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-11 w-48 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-11 w-40 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="h-4 w-72 rounded-full bg-slate-200/80 dark:bg-white/10" />
              </div>
              <Skeleton className="hidden h-8 w-28 rounded-full bg-slate-200/80 dark:bg-white/10 sm:block" />
            </div>

            <div className="mt-5 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <MethodCardSkeleton key={index} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <Skeleton className="h-5 w-52 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="mt-2 h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="mt-2 h-4 w-3/4 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="mt-5 h-11 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            </div>

            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <Skeleton className="h-5 w-44 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
