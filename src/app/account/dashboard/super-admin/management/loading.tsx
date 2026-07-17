import { Skeleton } from "@/components/ui/skeleton";

function MemberCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-xl bg-slate-200/80 dark:bg-white/10" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-3.5 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-16 rounded-full bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="h-5 w-20 rounded-full bg-slate-200/80 dark:bg-white/10" />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-12 rounded-full bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="h-4 w-16 rounded-full bg-slate-200/80 dark:bg-white/10" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-5 w-44 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-10 w-72 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>
        <Skeleton className="h-11 w-40 rounded-xl bg-slate-200/80 dark:bg-white/10" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <MemberCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
