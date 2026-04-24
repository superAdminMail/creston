import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <div className="rounded-2xl border border-border/60 bg-background/80 shadow-sm">
        <div className="space-y-6 p-5 md:p-6">
          <div className="space-y-3">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-8 w-72 max-w-full rounded-2xl" />
            <Skeleton className="h-4 w-full max-w-3xl rounded-full" />
            <Skeleton className="h-4 w-5/6 max-w-2xl rounded-full" />
          </div>

          <div className="grid gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] xl:items-end">
            <div className="space-y-3">
              <Skeleton className="h-3 w-28 rounded-full" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-9 w-24 rounded-full" />
                <Skeleton className="h-9 w-28 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
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

          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-56 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-background/80 shadow-sm">
        <div className="p-4 md:p-6">
          <div className="space-y-3">
            <div className="hidden lg:grid lg:grid-cols-7 lg:gap-4">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>

            <div className="space-y-4 lg:hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40 rounded-full" />
                      <Skeleton className="h-3 w-28 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="mt-4 grid gap-2">
                    <Skeleton className="h-3 w-3/4 rounded-full" />
                    <Skeleton className="h-3 w-2/3 rounded-full" />
                    <Skeleton className="h-3 w-1/2 rounded-full" />
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden space-y-0 overflow-hidden rounded-2xl border border-border/60 lg:block">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-7 gap-4 border-b border-border/50 px-4 py-5 last:border-b-0"
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
