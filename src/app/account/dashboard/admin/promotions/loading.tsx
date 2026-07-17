import { Share2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/95 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="space-y-2 border-b border-border/60 px-4 py-4 sm:px-6 sm:py-5 dark:border-white/10">
          <Skeleton className="h-5 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>

        <div className="px-4 py-4 sm:px-6 sm:py-6">
          <div className="space-y-5">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-11 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            </div>

            <div className="rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-44 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <Skeleton className="h-4 w-72 rounded-full bg-slate-200/80 dark:bg-white/10" />
                </div>
                <Skeleton className="h-9 w-14 rounded-full bg-slate-200/80 dark:bg-white/10" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <Skeleton className="h-11 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-20 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <Skeleton className="h-24 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            </div>

            <div className="rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <Skeleton className="h-4 w-64 rounded-full bg-slate-200/80 dark:bg-white/10" />
                </div>
                <Skeleton className="h-9 w-14 rounded-full bg-slate-200/80 dark:bg-white/10" />
              </div>
              <div className="mt-4 rounded-2xl border border-blue-200/70 bg-blue-50/80 p-3">
                <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="mt-2 h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="mt-2 h-4 w-2/3 rounded-full bg-slate-200/80 dark:bg-white/10" />
              </div>
            </div>

            <div className="flex justify-end">
              <div className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-white shadow-sm">
                <Share2 className="h-4 w-4" />
                <Skeleton className="h-4 w-24 rounded-full bg-white/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/95 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="space-y-2 border-b border-border/60 px-4 py-4 sm:px-6 sm:py-5 dark:border-white/10">
          <Skeleton className="h-5 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
        </div>

        <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <Skeleton className="h-3.5 w-60 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <Skeleton className="h-3.5 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <Skeleton className="h-8 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="h-4 w-3/4 rounded-full bg-slate-200/80 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
