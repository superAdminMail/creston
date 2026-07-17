import { Skeleton } from "@/components/ui/skeleton";

import { ResponsiveCollectionLoading } from "../../_components/ResponsiveCollectionLoading";

function StatSkeleton() {
  return (
    <div className="rounded-[1.5rem] border border-border/60 bg-white/95 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="mt-3 h-7 w-28 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="mt-3 h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
            <StatSkeleton />
            <StatSkeleton />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-5 w-72 rounded-full bg-slate-200/80 dark:bg-white/10" />
          </div>
          <Skeleton className="h-10 w-24 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
        </div>

        <div className="mt-5 space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[1.5rem] border border-border/60 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-full max-w-md rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <Skeleton className="h-3.5 w-56 rounded-full bg-slate-200/80 dark:bg-white/10" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full bg-slate-200/80 dark:bg-white/10" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-10 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="h-10 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-11 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-11 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          </div>
          <div className="space-y-2 md:justify-self-end">
            <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-11 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10 md:w-44" />
          </div>
        </div>

        <div className="mt-6">
          <ResponsiveCollectionLoading
            mobileCards={6}
            desktopColumns={5}
            desktopRows={8}
            mobileCardFields={5}
            tableMinWidthClassName="min-w-[1080px]"
          />
        </div>
      </section>
    </div>
  );
}
