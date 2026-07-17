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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <section className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950/95 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Skeleton className="h-4 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
            <StatSkeleton />
            <StatSkeleton />
          </div>
        </div>
      </section>

      <section className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950/95 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-8 w-56 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-10 w-28 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          </div>
        </div>

        <div className="mt-6">
          <ResponsiveCollectionLoading
            mobileCards={6}
            desktopColumns={4}
            desktopRows={6}
            mobileCardFields={4}
            tableMinWidthClassName="min-w-[980px]"
          />
        </div>
      </section>
    </div>
  );
}
