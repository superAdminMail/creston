import { Skeleton } from "@/components/ui/skeleton";

import { ResponsiveCollectionLoading } from "../../_components/ResponsiveCollectionLoading";

export default function Loading() {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.8rem] border border-slate-200/80 bg-white/95 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <Skeleton className="h-4 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="mt-2 h-9 w-48 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
        <Skeleton className="mt-2 h-5 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
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
            mobileCards={10}
            desktopColumns={8}
            desktopRows={10}
            mobileCardFields={5}
            tableMinWidthClassName="min-w-[1240px]"
          />
        </div>
      </section>
    </div>
  );
}
