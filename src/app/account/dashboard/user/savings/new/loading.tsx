import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../../_components/dashboardSurfaces";

function ProductSkeleton() {
  return (
    <Card className="rounded-[1.75rem] border border-border/60 bg-white/75 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36 rounded-full bg-slate-200/80" />
            <Skeleton className="h-3 w-20 rounded-full bg-slate-200/80" />
          </div>
          <Skeleton className="h-7 w-20 rounded-full bg-slate-200/80" />
        </div>

        <Skeleton className="h-12 w-full rounded-2xl bg-slate-200/80" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded-full bg-slate-200/80" />
          <Skeleton className="h-4 w-5/6 rounded-full bg-slate-200/80" />
          <Skeleton className="h-4 w-2/3 rounded-full bg-slate-200/80" />
        </div>
      </CardContent>
    </Card>
  );
}

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32 rounded-full bg-slate-200/80" />
      <Skeleton className="h-11 w-full rounded-2xl bg-slate-200/80" />
      <Skeleton className="h-3 w-44 rounded-full bg-slate-200/80" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between`}>
        <div className="space-y-3">
          <Skeleton className="h-4 w-28 rounded-full bg-slate-200/80" />
          <Skeleton className="h-10 w-full max-w-md rounded-2xl bg-slate-200/80" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-slate-200/80" />
        </div>

        <Skeleton className="h-10 w-40 rounded-full bg-slate-200/80" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>

        <section className={`${DASHBOARD_PAGE_SURFACE_CLASS} space-y-6 p-6 sm:p-8`}>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-full bg-slate-200/80" />
            <Skeleton className="h-4 w-full max-w-sm rounded-full bg-slate-200/80" />
          </div>

          <div className="space-y-5">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <div className="rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm">
              <Skeleton className="h-4 w-44 rounded-full bg-slate-200/80" />
              <Skeleton className="mt-3 h-4 w-full rounded-full bg-slate-200/80" />
              <Skeleton className="mt-2 h-4 w-5/6 rounded-full bg-slate-200/80" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Skeleton className="h-10 w-32 rounded-2xl bg-slate-200/80" />
            <Skeleton className="h-11 w-44 rounded-2xl bg-slate-200/80" />
          </div>
        </section>
      </div>
    </div>
  );
}
