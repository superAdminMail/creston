import { Skeleton } from "@/components/ui/skeleton";

import { ResponsiveCollectionLoading } from "../../_components/ResponsiveCollectionLoading";

function StatSkeleton() {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="mt-3 h-7 w-28 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="mt-3 h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] md:p-8">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <StatSkeleton key={index} />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[1.35rem] border border-border/60 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <Skeleton className="h-4 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="mt-3 h-10 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-4 w-52 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-10 w-28 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
        </div>

        <div className="mt-6">
          <ResponsiveCollectionLoading
            mobileCards={6}
            desktopColumns={6}
            desktopRows={8}
            mobileCardFields={4}
            tableMinWidthClassName="min-w-[1040px]"
          />
        </div>
      </section>
    </div>
  );
}
