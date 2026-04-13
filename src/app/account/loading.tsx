import { DashboardNavbarSkeleton } from "@/components/skeletons/DashboardNavbarSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

function PanelSkeleton() {
  return (
    <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
      <div className="space-y-3">
        <Skeleton className="h-5 w-40 bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="h-4 w-72 bg-slate-200/80 dark:bg-white/10" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-32 rounded-[1.5rem] bg-slate-200/80 dark:bg-white/10"
          />
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050b1f]">
      <DashboardNavbarSkeleton />
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <PanelSkeleton />
      </div>
    </div>
  );
}
