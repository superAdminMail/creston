import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-full max-w-sm rounded-2xl bg-white/10" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
        </div>

        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-11 w-36 rounded-2xl bg-white/10" />
          <Skeleton className="h-11 w-28 rounded-2xl bg-white/10" />
          <Skeleton className="h-11 w-32 rounded-2xl bg-white/10" />
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-full bg-white/10" />
            <Skeleton className="h-3 w-36 rounded-full bg-white/10" />
            <Skeleton className="h-3 w-48 rounded-full bg-white/10" />
          </div>

          <Skeleton className="h-7 w-24 rounded-full bg-white/10" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
          >
            <Skeleton className="h-3 w-20 rounded-full bg-white/10" />
            <Skeleton className="mt-3 h-6 w-32 rounded-2xl bg-white/10" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
        <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
        <Skeleton className="mt-2 h-4 w-3/4 rounded-full bg-white/10" />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Skeleton className="h-4 w-full rounded-full bg-white/10" />
          <Skeleton className="h-4 w-full rounded-full bg-white/10" />
          <Skeleton className="h-4 w-full rounded-full bg-white/10" />
          <Skeleton className="h-4 w-full rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}
