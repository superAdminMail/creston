import { Skeleton } from "@/components/ui/skeleton";

function PaymentMethodCardSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-2xl bg-white/10" />
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-5 w-32 rounded-full bg-white/10" />
            <Skeleton className="h-4 w-24 rounded-full bg-white/10" />
          </div>
        </div>

        <Skeleton className="h-7 w-20 rounded-full bg-white/10" />
      </div>

      <div className="mt-5 space-y-3">
        <Skeleton className="h-4 w-full rounded-full bg-white/10" />
        <Skeleton className="h-4 w-5/6 rounded-full bg-white/10" />
        <Skeleton className="h-4 w-2/3 rounded-full bg-white/10" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Skeleton className="h-10 w-28 rounded-full bg-white/10" />
        <Skeleton className="h-10 w-24 rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
          <Skeleton className="h-8 w-52 rounded-2xl bg-white/10" />
          <Skeleton className="h-5 w-full max-w-md rounded-full bg-white/10" />
        </div>

        <Skeleton className="h-11 w-40 rounded-2xl bg-white/10" />
      </div>

      <div className="rounded-2xl border border-amber-200/60 bg-amber-50 p-4 shadow-sm dark:border-amber-400/20 dark:bg-amber-500/5">
        <Skeleton className="h-4 w-full max-w-2xl rounded-full bg-white/10" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <PaymentMethodCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
