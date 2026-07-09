import { Skeleton } from "@/components/ui/skeleton";

import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
  DASHBOARD_TABLE_SHELL_CLASS,
} from "../../_components/dashboardSurfaces";

function HeroStatSkeleton() {
  return (
    <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-4`}>
      <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="mt-3 h-7 w-28 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
      <Skeleton className="mt-3 h-4 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
    </div>
  );
}

function TableRowSkeleton({ columns }: { columns: number }) {
  return (
    <tr className="border-b border-slate-200/80 last:border-b-0 dark:border-white/10">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-4">
          <Skeleton className="h-4 w-full max-w-44 rounded-full bg-slate-200/80 dark:bg-white/10" />
        </td>
      ))}
    </tr>
  );
}

export default function Loading() {
  return (
    <div className="space-y-8">
      <section className={`${DASHBOARD_PAGE_PANEL_CLASS} overflow-hidden p-6 md:p-8`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Skeleton className="h-4 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
            <HeroStatSkeleton />
          </div>
        </div>
      </section>

      <section className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-5 sm:p-6`}>
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

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="overflow-x-auto">
            <div className={`${DASHBOARD_TABLE_SHELL_CLASS} overflow-hidden`}>
              <table className="min-w-[960px] w-full text-left">
                <thead className="bg-white/80 dark:bg-white/[0.04]">
                  <tr className="border-b border-slate-200/80 dark:border-white/10">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <th key={index} className="px-4 py-4">
                        <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <TableRowSkeleton key={index} columns={5} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
