import { Skeleton } from "@/components/ui/skeleton";

function NotificationDetailHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-10 w-40 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="h-11 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10 sm:w-52" />
    </div>
  );
}

function NotificationDetailCardSkeleton() {
  return (
    <article className="rounded-[1.8rem] border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-start">
        <Skeleton className="h-11 w-11 shrink-0 rounded-2xl bg-slate-200/80 dark:bg-white/10 sm:h-12 sm:w-12" />

        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-28 bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-9 w-[min(22rem,100%)] bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-4 w-44 bg-slate-200/80 dark:bg-white/10" />
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-4 w-11/12 bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-4 w-10/12 bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-4 w-9/12 bg-slate-200/80 dark:bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8">
      <NotificationDetailHeaderSkeleton />
      <NotificationDetailCardSkeleton />
    </div>
  );
}
