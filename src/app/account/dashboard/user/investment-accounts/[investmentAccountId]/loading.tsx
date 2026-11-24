import { Skeleton } from "@/components/ui/skeleton";

const SURFACE =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6";

function SummaryCardSkeleton() {
  return (
    <div className={SURFACE}>
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="size-10 rounded-xl" />
      </div>
      <Skeleton className="mt-5 h-7 w-32 rounded-lg" />
      <Skeleton className="mt-3 h-3.5 w-24 rounded-full" />
    </div>
  );
}

function PlanOverviewSkeleton() {
  return (
    <section className={SURFACE}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-3.5 w-32 rounded-full" />
          <Skeleton className="h-7 w-56 max-w-full rounded-lg" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>

      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-5/6 rounded-full" />
        <Skeleton className="h-4 w-2/3 rounded-full" />
      </div>

      <div className="mt-7 flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>

      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductSkeleton() {
  return (
    <section className={SURFACE}>
      <div className="space-y-3">
        <Skeleton className="h-3.5 w-32 rounded-full" />
        <Skeleton className="h-6 w-48 max-w-full rounded-lg" />
      </div>

      <div className="mt-5 flex items-start gap-4">
        <Skeleton className="size-16 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-5 w-40 max-w-full rounded-full" />
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-4/5 rounded-full" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="mt-3 h-5 w-28 rounded-full" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="mt-3 h-5 w-28 rounded-full" />
        </div>
      </div>
    </section>
  );
}

function MetaSkeleton() {
  return (
    <section className={SURFACE}>
      <div className="space-y-3">
        <Skeleton className="h-3.5 w-32 rounded-full" />
        <Skeleton className="h-6 w-44 rounded-lg" />
      </div>

      <div className="mt-6 space-y-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-9 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="h-4 w-36 max-w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="mt-3 h-6 w-28 rounded-full" />
      </div>
    </section>
  );
}

function ActivitySkeleton() {
  return (
    <section className={SURFACE}>
      <div className="space-y-3">
        <Skeleton className="h-3.5 w-32 rounded-full" />
        <Skeleton className="h-6 w-40 rounded-lg" />
      </div>

      <div className="mt-6 space-y-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex flex-col items-center">
              <Skeleton className="size-3 rounded-full" />
              {index !== 3 && (
                <Skeleton className="mt-2 h-12 w-px rounded-full" />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-36 max-w-full rounded-full" />
              <Skeleton className="h-3.5 w-full rounded-full" />
              <Skeleton className="h-3.5 w-3/4 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
      <section className={SURFACE}>
        <Skeleton className="h-4 w-32 rounded-full" />

        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-8 w-72 max-w-full rounded-lg" />
            <Skeleton className="h-4 w-full max-w-lg rounded-full" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SummaryCardSkeleton key={index} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="min-w-0 space-y-6">
          <PlanOverviewSkeleton />
          <ProductSkeleton />
        </div>

        <aside className="min-w-0 space-y-6">
          <MetaSkeleton />
          <ActivitySkeleton />
        </aside>
      </section>
    </div>
  );
}
