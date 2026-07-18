import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
        <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-white/10" />
        <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
      </div>

      <div className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
        <Skeleton className="h-4 w-36 rounded-full bg-white/10" />
        <Skeleton className="mt-3 h-5 w-full max-w-2xl rounded-full bg-white/10" />

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[1.5rem] border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <Skeleton className="h-5 w-44 rounded-full bg-white/10" />
              <Skeleton className="mt-3 h-4 w-24 rounded-full bg-white/10" />
              <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
              <div className="mt-4 flex flex-wrap gap-2">
                <Skeleton className="h-7 w-20 rounded-full bg-white/10" />
                <Skeleton className="h-7 w-16 rounded-full bg-white/10" />
                <Skeleton className="h-7 w-20 rounded-full bg-white/10" />
              </div>
              <Skeleton className="mt-4 h-4 w-32 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
