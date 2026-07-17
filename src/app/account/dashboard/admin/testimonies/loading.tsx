import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-9 w-48 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl bg-slate-200/80 dark:bg-white/10" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[1.75rem] border border-border/60 bg-white/95 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-36 rounded-full bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
              </div>
              <Skeleton className="h-5 w-12 rounded-full bg-slate-200/80 dark:bg-white/10" />
            </div>
            <Skeleton className="mt-4 h-24 rounded-[1.25rem] bg-slate-200/80 dark:bg-white/10" />
            <div className="mt-4 flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-20 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-4 w-20 rounded-full bg-slate-200/80 dark:bg-white/10" />
            </div>
            <Skeleton className="mt-4 h-9 w-20 rounded-xl bg-slate-200/80 dark:bg-white/10" />
          </div>
        ))}
      </div>

      <div className="rounded-[1.75rem] border border-dashed border-border/60 bg-white/80 p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <Skeleton className="mx-auto h-4 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
      </div>
    </div>
  );
}
