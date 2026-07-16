import { Skeleton } from "@/components/ui/skeleton";

import { ResponsiveCollectionLoading } from "../../_components/ResponsiveCollectionLoading";

function StatCardSkeleton() {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950/95">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-8 w-20 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-4 w-36 rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>
        <Skeleton className="h-11 w-11 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
      </div>
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
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </section>

      <section className="rounded-[1.9rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950/95 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-8 w-56 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-10 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10 sm:w-64" />
            <Skeleton className="h-10 w-28 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          </div>
        </div>

        <div className="mt-6">
          <ResponsiveCollectionLoading
            mobileCards={6}
            desktopColumns={9}
            desktopRows={6}
            mobileCardFields={6}
            tableMinWidthClassName="min-w-[980px]"
          />
        </div>
      </section>
    </div>
  );
}
