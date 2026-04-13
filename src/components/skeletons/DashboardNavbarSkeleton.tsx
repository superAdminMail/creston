import { Skeleton } from "@/components/ui/skeleton";

export function DashboardNavbarSkeleton() {
  return (
    <div className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/78 backdrop-blur-xl dark:border-white/10 dark:bg-[#08111d]/76">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-[1.35rem] bg-slate-200/80 dark:bg-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-3 w-24 bg-slate-200/80 dark:bg-white/10" />
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Skeleton className="h-10 w-10 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-10 w-10 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-10 w-10 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}
