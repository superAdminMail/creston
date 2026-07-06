import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl sm:p-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-9 w-72 max-w-full rounded-2xl" />
            <Skeleton className="h-4 w-full max-w-3xl rounded-full" />
            <Skeleton className="h-4 w-5/6 max-w-2xl rounded-full" />
          </div>

          <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] xl:items-end">
            <div className="space-y-3">
              <Skeleton className="h-3 w-28 rounded-full" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-9 w-24 rounded-full" />
                <Skeleton className="h-9 w-28 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-3 w-28 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-full rounded-2xl" />
                <Skeleton className="h-10 w-20 rounded-2xl" />
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-3 w-24 rounded-full" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Skeleton className="h-4 w-56 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-xl sm:p-6">
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <div className="min-w-[840px] rounded-[1.5rem] border border-white/10">
              <div className="grid grid-cols-7 gap-4 border-b border-white/10 bg-white/[0.04] px-4 py-4">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-4 w-28 rounded-full" />
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-20 rounded-full" />
              </div>

              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-7 gap-4 border-b border-white/10 bg-white/[0.03] px-4 py-5 last:border-b-0"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40 rounded-full" />
                    <Skeleton className="h-3 w-28 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 rounded-full" />
                    <Skeleton className="h-3 w-20 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-44 rounded-full" />
                    <Skeleton className="h-3 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
