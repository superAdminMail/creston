import { Skeleton } from "@/components/ui/skeleton";

const SURFACE =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6";

function MetricCardSkeleton() {
  return (
    <div className={SURFACE}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-3.5 w-full max-w-40 rounded-full" />
        </div>
        <Skeleton className="size-11 shrink-0 rounded-xl" />
      </div>
    </div>
  );
}

function SavingsCardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-44 max-w-full rounded-full" />
          <Skeleton className="h-4 w-32 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <Skeleton className="h-3.5 w-28 rounded-full" />
        <Skeleton className="mt-3 h-8 w-40 max-w-full rounded-lg" />
        <div className="mt-4 flex items-center justify-between gap-3">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-4 w-28 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-24 max-w-full rounded-full" />
            <Skeleton className="h-4 w-32 max-w-full rounded-full" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
        <Skeleton className="h-3.5 w-28 rounded-full" />
        <Skeleton className="mt-3 h-4 w-full rounded-full" />
        <Skeleton className="mt-2 h-4 w-4/5 rounded-full" />
      </div>

      <div className="mt-auto border-t border-slate-200 pt-4 dark:border-white/10">
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-11 rounded-xl" />
          <Skeleton className="h-11 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function SectionHeaderSkeleton({ closed = false }: { closed?: boolean }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 max-w-full rounded-full" />
      </div>
      <Skeleton className={`h-4 rounded-full ${closed ? "w-28" : "w-20"}`} />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-8">
      <section className={SURFACE}>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-8 w-72 max-w-full rounded-lg sm:h-9" />
            <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl sm:w-44" />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </section>

      <section className="space-y-4">
        <SectionHeaderSkeleton />

        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SavingsCardSkeleton key={index} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 dark:border-white/10 dark:bg-slate-900/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 rounded-lg" />
              <Skeleton className="h-4 w-72 max-w-full rounded-full" />
            </div>
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <SavingsCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
