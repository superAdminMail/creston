import { Skeleton } from "@/components/ui/skeleton";

function TransactionCardSkeleton() {
  return (
    <div className="rounded-[1.25rem] border border-border/60 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
          <Skeleton className="h-4 w-full max-w-sm rounded-full bg-white/10" />
          <Skeleton className="h-3.5 w-28 rounded-full bg-white/10" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 rounded-full bg-white/10" />
          <Skeleton className="h-4 w-full rounded-full bg-white/10" />
          <Skeleton className="h-4 w-4/5 rounded-full bg-white/10" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 rounded-full bg-white/10" />
          <Skeleton className="h-5 w-24 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="space-y-3">
        <Skeleton className="h-8 w-44 rounded-2xl bg-white/10" />
        <Skeleton className="h-5 w-full max-w-xl rounded-full bg-white/10" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-24 rounded-full bg-white/10" />
        ))}
      </div>

      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <TransactionCardSkeleton key={index} />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <div className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-border/60 dark:border-white/10">
                {Array.from({ length: 6 }).map((_, index) => (
                  <th key={index} className="px-4 py-4">
                    <Skeleton className="h-3 w-20 rounded-full bg-white/10" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-border/60 last:border-b-0 dark:border-white/10"
                >
                  {Array.from({ length: 6 }).map((_, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-4">
                      <Skeleton className="h-4 w-full max-w-36 rounded-full bg-white/10" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
