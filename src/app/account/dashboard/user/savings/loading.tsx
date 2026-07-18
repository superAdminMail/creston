import { Skeleton } from "@/components/ui/skeleton";

function SavingsCardSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-5 w-44 rounded-full bg-white/10" />
          <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-full bg-white/10" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full bg-white/10" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-20 rounded-full bg-white/10" />
            <Skeleton className="h-4 w-full rounded-full bg-white/10" />
          </div>
        ))}
      </div>

      <Skeleton className="mt-5 h-12 rounded-2xl bg-white/10" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-border/60 bg-white/75 p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between lg:p-6 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="min-w-0 space-y-3">
          <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
          <Skeleton className="h-9 w-full max-w-xl rounded-2xl bg-white/10" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
        </div>
        <Skeleton className="h-11 w-40 rounded-2xl bg-white/10" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[1.9rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
          >
            <Skeleton className="h-3 w-24 rounded-full bg-white/10" />
            <Skeleton className="mt-3 h-8 w-20 rounded-2xl bg-white/10" />
            <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="min-w-0 space-y-6">
          <div className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
            <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
            <Skeleton className="mt-3 h-8 w-56 rounded-2xl bg-white/10" />
            <Skeleton className="mt-3 h-5 w-full max-w-2xl rounded-full bg-white/10" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <SavingsCardSkeleton key={index} />
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
            <Skeleton className="h-4 w-40 rounded-full bg-white/10" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <SavingsCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-6">
          <div className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
            <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <Skeleton className="h-4 w-44 rounded-full bg-white/10" />
                  <Skeleton className="mt-2 h-4 w-full rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
            <Skeleton className="h-4 w-40 rounded-full bg-white/10" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 rounded-2xl bg-white/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
