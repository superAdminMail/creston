import { Skeleton } from "@/components/ui/skeleton";

import { DASHBOARD_PAGE_SURFACE_CLASS } from "../../../_components/dashboardSurfaces";

function FieldSkeleton({
  labelWidth = "w-32",
  inputHeight = "h-11",
}: {
  labelWidth?: string;
  inputHeight?: string;
}) {
  return (
    <div className="space-y-2">
      <Skeleton className={`h-3 ${labelWidth} rounded-full bg-slate-200/80 dark:bg-white/10`} />
      <Skeleton className={`${inputHeight} w-full rounded-2xl bg-slate-200/80 dark:bg-white/10`} />
    </div>
  );
}

function SectionSkeleton() {
  return (
    <section className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-6 sm:p-8`}>
      <div className="max-w-3xl space-y-3">
        <Skeleton className="h-6 w-56 rounded-full bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="h-4 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
      </div>

      <div className="mt-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldSkeleton labelWidth="w-36" />
          <FieldSkeleton labelWidth="w-32" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldSkeleton labelWidth="w-32" />
          <FieldSkeleton labelWidth="w-28" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldSkeleton labelWidth="w-40" />
          <FieldSkeleton labelWidth="w-32" />
        </div>

        <FieldSkeleton labelWidth="w-40" inputHeight="h-14" />

        <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <Skeleton className="h-4 w-44 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="mt-3 h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="mt-2 h-4 w-5/6 rounded-full bg-slate-200/80 dark:bg-white/10" />

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-11 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-11 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-11 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <Skeleton className="h-4 w-36 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-12 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-12 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          </div>
        </div>

        <Skeleton className="h-12 w-40 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
      </div>
    </section>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="mb-3 h-4 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-10 w-full max-w-md rounded-2xl bg-slate-200/80 dark:bg-white/10 sm:h-12" />
          <Skeleton className="mt-3 h-5 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>

        <Skeleton className="h-10 w-36 rounded-full bg-sky-200/80 dark:bg-sky-400/20" />
      </div>

      <SectionSkeleton />
    </div>
  );
}
