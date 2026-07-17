import { Skeleton } from "@/components/ui/skeleton";

function StatSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <Skeleton className="h-3 w-24 rounded-full bg-white/10" />
      <Skeleton className="mt-3 h-7 w-28 rounded-2xl bg-white/10" />
      <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
    </div>
  );
}

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#111827_0%,#0f3d5e_44%,#0f766e_100%)] shadow-[0_22px_70px_rgba(15,23,42,0.22)]">
        <div className="flex flex-col gap-6 p-5 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
            <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-white/10" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-8 w-32 rounded-full bg-white/10" />
            <Skeleton className="h-8 w-36 rounded-full bg-white/10" />
            <Skeleton className="h-8 w-32 rounded-full bg-white/10" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatSkeleton key={index} />
        ))}
      </section>

      <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
        <div className="space-y-4">
          <Skeleton className="h-4 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-8 w-full max-w-xl rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-24 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10"
              />
            ))}
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
            <Skeleton className="min-h-[22rem] rounded-[1.5rem] bg-slate-200/80 dark:bg-white/10" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-24 w-full rounded-[1.35rem] bg-slate-200/80 dark:bg-white/10"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
