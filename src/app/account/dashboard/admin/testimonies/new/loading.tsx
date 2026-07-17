import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] md:p-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="h-9 w-44 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="h-4 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="space-y-2 rounded-[1.5rem] border border-border/60 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <Skeleton className="h-3 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-11 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <div className="rounded-[1.5rem] border border-border/60 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <Skeleton className="h-3 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="mt-3 h-28 rounded-[1.25rem] bg-slate-200/80 dark:bg-white/10" />
          </div>

          <div className="rounded-[1.5rem] border border-border/60 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-11 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-11 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Skeleton className="h-11 w-full max-w-52 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
      </div>
    </div>
  );
}
