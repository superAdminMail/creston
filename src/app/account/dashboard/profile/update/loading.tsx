import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "../../_components/dashboardSurfaces";

const PROFILE_SURFACE_CLASS = cn(
  DASHBOARD_PAGE_SURFACE_CLASS,
  "rounded-[1.9rem] p-6 sm:p-7 lg:p-8",
);

function LoadingField() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="h-11 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
    </div>
  );
}

function LoadingProfileFormCard() {
  return (
    <Card
      className={cn(
        DASHBOARD_PAGE_SURFACE_CLASS,
        "overflow-hidden rounded-[1.9rem]",
      )}
    >
      <CardHeader className="flex items-center justify-between border-b border-slate-200/70 px-7 py-6 dark:border-white/10">
        <CardTitle className="text-slate-950 dark:text-white">
          <Skeleton className="h-5 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
        </CardTitle>
      </CardHeader>

      <CardContent className="p-7 sm:p-8 lg:p-9">
        <div className="space-y-7">
          <section>
            <div className="flex flex-col items-center gap-5">
              <div className="relative h-32 w-32">
                <Skeleton className="h-full w-full rounded-full border border-slate-200/80 bg-slate-200/80 dark:border-white/10 dark:bg-white/10" />
                <Skeleton className="absolute inset-x-0 bottom-0 h-6 rounded-none bg-slate-950/40 dark:bg-black/50" />
              </div>

              <Skeleton className="h-11 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-7 w-32 rounded-full bg-emerald-200/80 dark:bg-emerald-400/20" />
            </div>
          </section>

          <LoadingField />
          <LoadingField />

          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="mt-2 h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
          </div>

          <Skeleton className="h-12 w-36 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <div className={PROFILE_SURFACE_CLASS}>
      <div className="flex flex-col gap-5 border-b border-slate-200/70 pb-5 sm:gap-6 sm:pb-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/10">
        <div className="space-y-3">
          <div className="flex justify-between ">
            <Skeleton className="inline-flex h-6 w-36 rounded-full bg-sky-200/80 dark:bg-sky-400/20" />
            <Skeleton className="hidden h-6 w-36 rounded-full bg-sky-200/80 dark:bg-sky-400/20 md:inline-flex" />
          </div>
          <Skeleton className="h-8 w-64 rounded-full bg-slate-200/80 dark:bg-white/10 sm:h-10 sm:w-80" />

          <Skeleton className="mt-3 h-4 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>
        <Skeleton className="mb-3 h-5 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
      </div>

      <div className="mt-6">
        <LoadingProfileFormCard />
      </div>
    </div>
  );
}
