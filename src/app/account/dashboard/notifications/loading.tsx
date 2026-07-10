import { Skeleton } from "@/components/ui/skeleton";

function NotificationsHeaderSkeleton() {
  return (
    <div className="rounded-[1.8rem] border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-32 bg-slate-200/80 dark:bg-white/10" />
          <div className="space-y-3">
            <Skeleton className="h-9 w-[17rem] bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-5 w-[17rem] max-w-full bg-slate-200/80 dark:bg-white/10" />
          </div>
        </div>

        <Skeleton className="h-11 w-24 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-[92px] rounded-2xl bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="h-[92px] rounded-2xl bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="h-[92px] rounded-2xl bg-slate-200/80 dark:bg-white/10" />
      </div>
    </div>
  );
}

function NotificationsToolbarSkeleton() {
  return (
    <div className="rounded-[1.8rem] border border-slate-200/70 bg-white/90 p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-slate-200/80 bg-slate-50/90 px-3 py-2 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-sm bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-3.5 w-44 bg-slate-200/80 dark:bg-white/10" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-8 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex w-full items-start gap-3 rounded-[20px] border border-slate-200/80 bg-white/90 px-3 py-3.5 shadow-sm sm:px-4 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <Skeleton className="mt-0.5 h-4 w-4 rounded-sm bg-slate-200/80 dark:bg-white/10" />

            <Skeleton className="mt-0.5 h-10 w-10 shrink-0 rounded-2xl bg-slate-200/80 dark:bg-white/10" />

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-4 w-40 bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="h-3.5 w-24 bg-slate-200/80 dark:bg-white/10" />
              </div>

              <Skeleton className="h-4 w-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-4 w-11/12 bg-slate-200/80 dark:bg-white/10" />

              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-28 bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="h-3.5 w-20 bg-slate-200/80 dark:bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <NotificationsHeaderSkeleton />
      <NotificationsToolbarSkeleton />
      <div className="flex justify-end">
        <Skeleton className="h-4 w-32 bg-slate-200/80 dark:bg-white/10" />
      </div>
    </div>
  );
}
