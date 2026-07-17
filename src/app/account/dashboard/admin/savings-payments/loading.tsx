import { Skeleton } from "@/components/ui/skeleton";

function SurfaceBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-[1.75rem] border border-border/60 bg-white/80 p-4 shadow-sm dark:bg-white/[0.04] ${className}`}
    >
      <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
      <Skeleton className="mt-3 h-6 w-48 rounded-2xl bg-white/10" />
      <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-border/60 bg-white/80 p-4 shadow-sm sm:p-6 dark:bg-white/[0.04]">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
          <Skeleton className="h-10 w-full max-w-xl rounded-2xl bg-white/10" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/60 bg-white/80 p-4 shadow-sm sm:p-6 dark:bg-white/[0.04]">
        <div className="grid gap-4 rounded-[1.5rem] border border-border/60 bg-muted/20 p-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] xl:items-end">
          <SurfaceBlock />
          <SurfaceBlock />
          <SurfaceBlock />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-52 rounded-full bg-white/10" />
          <Skeleton className="h-10 w-28 rounded-2xl bg-white/10" />
        </div>

        <div className="mt-5 space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[1.5rem] border border-border/60 bg-white/80 p-4 shadow-sm dark:bg-white/[0.04]"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-56 rounded-full bg-white/10" />
                  <Skeleton className="h-4 w-40 rounded-full bg-white/10" />
                  <Skeleton className="h-3 w-64 rounded-full bg-white/10" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
                  <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
                  <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
