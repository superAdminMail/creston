import { Skeleton } from "@/components/ui/skeleton";

const SURFACE =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6";

function PlanCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-6 w-44 max-w-full rounded-lg" />
          <Skeleton className="h-4 w-32 max-w-full rounded-full" />
        </div>

        <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
      </div>

      <div className="mt-5 space-y-2">
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-4/5 rounded-full" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-white/10">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-4 w-28 max-w-full rounded-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-4 w-24 max-w-full rounded-full" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]">
          <Skeleton className="h-3 w-24 max-w-full rounded-full" />
          <Skeleton className="mt-3 h-6 w-16 rounded-lg" />
        </div>

        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]">
          <Skeleton className="h-3 w-28 max-w-full rounded-full" />
          <Skeleton className="mt-3 h-5 w-24 max-w-full rounded-lg" />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/10">
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-3 w-32 rounded-full" />
        <Skeleton className="h-8 w-72 max-w-full rounded-xl" />
        <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
        <Skeleton className="h-4 w-full max-w-xl rounded-full" />
      </div>

      <section className={SURFACE}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-6 w-56 max-w-full rounded-lg" />
            <Skeleton className="h-4 w-full max-w-lg rounded-full" />
          </div>

          <Skeleton className="h-7 w-28 rounded-full" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <PlanCardSkeleton key={index} />
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-48 max-w-full rounded-full" />
                <Skeleton className="h-3 w-full max-w-sm rounded-full" />
              </div>
            </div>

            <Skeleton className="h-11 w-full rounded-xl sm:w-40" />
          </div>
        </div>
      </section>
    </div>
  );
}
