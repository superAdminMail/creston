import { Skeleton } from "@/components/ui/skeleton";

function TileSkeleton() {
  return (
    <div className="rounded-[1.5rem] border border-border/60 bg-white/80 p-4 shadow-sm dark:bg-white/[0.04]">
      <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
      <Skeleton className="mt-3 h-5 w-48 rounded-2xl bg-white/10" />
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
          <Skeleton className="h-8 w-full max-w-xl rounded-2xl bg-white/10" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/60 bg-white/80 p-4 shadow-sm sm:p-6 dark:bg-white/[0.04]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <TileSkeleton key={index} />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/60 bg-white/80 p-4 shadow-sm sm:p-6 dark:bg-white/[0.04]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <TileSkeleton key={index} />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/60 bg-white/80 p-4 shadow-sm sm:p-6 dark:bg-white/[0.04]">
        <Skeleton className="h-6 w-36 rounded-full bg-white/10" />
        <Skeleton className="mt-4 h-10 w-40 rounded-2xl bg-white/10" />
        <div className="mt-4 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[1.5rem] border border-border/60 bg-muted/20 p-4"
            >
              <Skeleton className="h-4 w-40 rounded-full bg-white/10" />
              <Skeleton className="mt-3 h-3 w-full max-w-2xl rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
