import { Skeleton } from "@/components/ui/skeleton";

import { ResponsiveCollectionLoading } from "../_components/ResponsiveCollectionLoading";

const FLAT_PANEL_CLASS =
  "rounded-[1.75rem] border border-border/60 bg-white text-slate-950 dark:border-white/10 dark:bg-slate-900 dark:text-white";

const FLAT_SURFACE_CLASS =
  "rounded-[1.5rem] border border-border/60 bg-white text-slate-950 dark:border-white/10 dark:bg-slate-900 dark:text-white";

function StatSkeleton() {
  return (
    <div className={`${FLAT_SURFACE_CLASS} p-4`}>
      <Skeleton className="h-3 w-24 rounded-full bg-white/10" />
      <Skeleton className="mt-3 h-7 w-28 rounded-2xl bg-white/10" />
      <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
    </div>
  );
}

function UserHeroSkeleton() {
  return (
    <section className={`${FLAT_PANEL_CLASS} overflow-hidden p-6 md:p-8`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
          <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-white/10" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl xl:grid-cols-3">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
      </div>
    </section>
  );
}

function UserBodySkeleton() {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] ">
      <div className="space-y-6">
        <section className={`${FLAT_SURFACE_CLASS} p-5 sm:p-6`}>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
              <Skeleton className="h-8 w-56 rounded-2xl bg-white/10" />
              <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
            </div>
          </div>

          <div className="mt-6">
            <ResponsiveCollectionLoading
              mobileCards={6}
              desktopColumns={6}
              desktopRows={8}
              mobileCardFields={4}
              tableMinWidthClassName="min-w-[980px]"
            />
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className={`${FLAT_SURFACE_CLASS} p-5 sm:p-6`}>
          <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-12 rounded-2xl bg-white/10" />
            <Skeleton className="h-12 rounded-2xl bg-white/10" />
            <Skeleton className="h-12 rounded-2xl bg-white/10" />
          </div>
        </section>

        <section className={`${FLAT_SURFACE_CLASS} p-5 sm:p-6`}>
          <Skeleton className="h-4 w-40 rounded-full bg-white/10" />
          <Skeleton className="mt-5 h-64 rounded-[1.5rem] bg-white/10" />
        </section>
      </div>
    </section>
  );
}

export default function Loading() {
  return (
    <div className="space-y-8">
      <UserHeroSkeleton />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <StatSkeleton key={index} />
        ))}
      </section>
      <UserBodySkeleton />
    </div>
  );
}
