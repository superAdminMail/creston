import { Skeleton } from "@/components/ui/skeleton";

const SURFACE =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-8">
      <section className="space-y-4">
        <Skeleton className="h-4 w-32 rounded-full" />

        <div className="space-y-3">
          <Skeleton className="h-8 w-72 max-w-full rounded-lg" />
          <Skeleton className="h-4 w-full max-w-xl rounded-full" />
          <Skeleton className="h-4 w-4/5 max-w-lg rounded-full" />
        </div>
      </section>

      <section className={SURFACE}>
        <div className="space-y-3">
          <Skeleton className="h-3.5 w-32 rounded-full" />
          <Skeleton className="h-6 w-56 max-w-full rounded-lg" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="size-10 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-3.5 w-full rounded-full" />
                  <Skeleton className="h-3.5 w-4/5 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col justify-between gap-4 border-t border-slate-200 pt-5 dark:border-white/10 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-28 rounded-full" />
            <Skeleton className="h-5 w-36 rounded-full" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl sm:w-40" />
        </div>
      </section>
    </div>
  );
}
