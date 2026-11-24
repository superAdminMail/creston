import { Skeleton } from "@/components/ui/skeleton";

const SURFACE =
  "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900";

function ProductSkeleton() {
  return (
    <div className={`${SURFACE} flex h-full flex-col gap-5 p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-5 w-36 max-w-full rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="size-6 rounded-full" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-5/6 rounded-full" />
        <Skeleton className="h-4 w-2/3 rounded-full" />
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-4 dark:border-white/10">
        <Skeleton className="h-3.5 w-32 rounded-full" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2.5">
              <Skeleton className="size-4 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto border-t border-slate-100 pt-4 dark:border-white/10">
        <Skeleton className="h-4 w-32 rounded-full" />
      </div>
    </div>
  );
}

function FieldSkeleton({ textarea = false }: { textarea?: boolean }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-28 rounded-full" />
      <Skeleton className={`w-full rounded-xl ${textarea ? "h-28" : "h-11"}`} />
      {!textarea && <Skeleton className="h-3 w-48 max-w-full rounded-full" />}
    </div>
  );
}

function SetupPanelSkeleton() {
  return (
    <div className={`${SURFACE} space-y-6 p-5 sm:p-6`}>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="h-6 w-52 max-w-full rounded-lg" />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-4/5 rounded-full" />
      </div>

      <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-500/20 dark:bg-sky-500/[0.07]">
        <Skeleton className="h-3.5 w-28 rounded-full" />
        <Skeleton className="mt-3 h-5 w-36 rounded-full" />
        <Skeleton className="mt-2 h-3.5 w-24 rounded-full" />
      </div>

      <div className="space-y-5">
        <FieldSkeleton />
        <FieldSkeleton textarea />
        <FieldSkeleton />

        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <Skeleton className="mt-0.5 size-4 shrink-0 rounded" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-36 rounded-full" />
            <Skeleton className="h-3.5 w-full rounded-full" />
            <Skeleton className="h-3.5 w-4/5 rounded-full" />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-200 pt-5 dark:border-white/10">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3.5 w-28 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-8">
      <section className={`${SURFACE} p-5 sm:p-6`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <Skeleton className="h-4 w-32 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-8 w-72 max-w-full rounded-lg sm:h-9" />
              <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
              <Skeleton className="h-4 w-4/5 max-w-xl rounded-full" />
            </div>
          </div>
          <Skeleton className="hidden size-16 shrink-0 rounded-2xl sm:block" />
        </div>
      </section>

      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <Skeleton className="size-5 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-full max-w-md rounded-full" />
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="min-w-0 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-52 rounded-lg" />
            <Skeleton className="h-4 w-full max-w-sm rounded-full" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </section>

        <div className="min-w-0">
          <SetupPanelSkeleton />
        </div>
      </div>
    </div>
  );
}
