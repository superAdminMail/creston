import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-40 rounded-full bg-white/10" />
        <Skeleton className="h-10 w-full max-w-2xl rounded-2xl bg-white/10" />
        <Skeleton className="h-5 w-full max-w-xl rounded-full bg-white/10" />
      </div>

      <div className="rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
        <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
        <Skeleton className="mt-3 h-6 w-48 rounded-2xl bg-white/10" />
        <Skeleton className="mt-3 h-5 w-full max-w-2xl rounded-full bg-white/10" />

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <Skeleton className="h-5 w-24 rounded-full bg-white/10" />
              <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
              <Skeleton className="mt-2 h-4 w-4/5 rounded-full bg-white/10" />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Skeleton className="h-11 w-36 rounded-2xl bg-white/10" />
        </div>
      </div>
    </div>
  );
}
