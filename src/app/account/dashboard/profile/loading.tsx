import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../_components/dashboardSurfaces";

const PROFILE_PANEL_CLASS = cn(
  DASHBOARD_PAGE_PANEL_CLASS,
  "overflow-hidden rounded-[2.5rem] p-5 sm:p-7 lg:p-9",
);

const PROFILE_SURFACE_CLASS = cn(
  DASHBOARD_PAGE_SURFACE_CLASS,
  "rounded-[1.9rem] p-5 sm:p-6 lg:p-7",
);

function LoadingActionButton({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn(
        "h-12 rounded-2xl bg-slate-200/80 dark:bg-white/10",
        className,
      )}
    />
  );
}

function LoadingInfoCard() {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="mt-3 h-4 w-36 rounded-full bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="mt-2 h-4 w-20 rounded-full bg-slate-200/80 dark:bg-white/10" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className={PROFILE_PANEL_CLASS}>
      <div className="flex flex-col gap-5 border-b border-slate-200/70 pb-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:pb-6 dark:border-white/10">
        <div className="min-w-0">
          <Skeleton className="h-6 w-36 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="mt-4 h-8 w-56 rounded-full bg-slate-200/80 dark:bg-white/10 sm:h-10 sm:w-72" />
          <Skeleton className="mt-3 h-4 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-end">
          <LoadingActionButton className="w-full sm:w-44" />
          <LoadingActionButton className="w-full sm:w-52" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:mt-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:gap-6">
        <div className="space-y-4 sm:space-y-6">
          <section className={PROFILE_SURFACE_CLASS}>
            <div className="flex flex-col items-center text-center">
              <div className="group relative h-24 w-24 overflow-hidden rounded-full border border-slate-200/80 bg-white/80 shadow-sm sm:h-28 sm:w-28 dark:border-white/10 dark:bg-white/[0.04]">
                <Skeleton className="h-full w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="absolute inset-x-0 bottom-0 h-6 rounded-none bg-slate-950/40 dark:bg-black/50" />
              </div>

              <Skeleton className="mt-4 h-7 w-40 rounded-full bg-emerald-200/80 dark:bg-emerald-400/20" />
              <Skeleton className="mt-4 h-6 w-44 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="mt-2 h-4 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
            </div>
          </section>

          <section className={PROFILE_SURFACE_CLASS}>
            <Skeleton className="h-5 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="mt-2 h-4 w-72 max-w-full rounded-full bg-slate-200/80 dark:bg-white/10" />

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <LoadingInfoCard />
              <LoadingInfoCard />
              <LoadingInfoCard />
            </div>
          </section>

          <section className={PROFILE_SURFACE_CLASS}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Skeleton className="h-5 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="mt-2 h-4 w-64 rounded-full bg-slate-200/80 dark:bg-white/10" />
              </div>
              <Skeleton className="h-7 w-16 rounded-full bg-sky-200/80 dark:bg-sky-400/20" />
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <Skeleton className="h-3 w-20 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="mt-3 h-6 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <LoadingActionButton className="w-full sm:flex-1" />
                <LoadingActionButton className="w-full sm:w-40" />
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-4 sm:gap-6">
          <section className={PROFILE_SURFACE_CLASS}>
            <Skeleton className="h-5 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="mt-2 h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="mt-2 h-4 w-11/12 rounded-full bg-slate-200/80 dark:bg-white/10" />

            <div className="mt-5">
              <LoadingActionButton className="w-40" />
            </div>
          </section>

          <section className={PROFILE_SURFACE_CLASS}>
            <Skeleton className="h-5 w-36 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="mt-3 h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="mt-2 h-4 w-10/12 rounded-full bg-slate-200/80 dark:bg-white/10" />
          </section>
        </div>
      </div>
    </div>
  );
}
