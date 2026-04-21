import { Skeleton } from "@/components/ui/skeleton";

const cardClassName =
  "rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]";

function DashboardHeaderSkeleton() {
  return (
    <section className={cardClassName}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-6 w-44 rounded-full" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
        </div>

        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-11 w-32 rounded-2xl" />
          <Skeleton className="h-11 w-32 rounded-2xl" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-2xl" />
        ))}
      </div>
    </section>
  );
}

function DashboardBodySkeleton() {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
      <div className="space-y-6">
        <div className={cardClassName}>
          <Skeleton className="h-5 w-36 rounded-full" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>

        <div className={cardClassName}>
          <Skeleton className="h-5 w-48 rounded-full" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-11/12 rounded-full" />
            <Skeleton className="h-4 w-10/12 rounded-full" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className={cardClassName}>
          <Skeleton className="h-5 w-32 rounded-full" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
          </div>
        </div>

        <div className={cardClassName}>
          <Skeleton className="h-5 w-36 rounded-full" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-10 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-2xl" />
            <Skeleton className="h-10 w-3/4 rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <DashboardHeaderSkeleton />
      <DashboardBodySkeleton />
    </div>
  );
}
