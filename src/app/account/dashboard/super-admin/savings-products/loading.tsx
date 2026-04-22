import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-5 w-40 rounded-full bg-white/10" />
          <Skeleton className="h-10 w-72 rounded-2xl bg-white/10" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
        </div>
        <Skeleton className="h-11 w-44 rounded-xl bg-white/10" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-28 w-full rounded-[1.75rem] bg-white/10"
          />
        ))}
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <section
            key={index}
            className="card-premium rounded-[1.75rem] p-5 sm:p-6"
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:justify-between">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Skeleton className="h-6 w-52 rounded-full bg-white/10" />
                  <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((__, statIndex) => (
                    <div key={statIndex} className="space-y-2">
                      <Skeleton className="h-3 w-20 rounded-full bg-white/10" />
                      <Skeleton className="h-5 w-28 rounded-full bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 xl:w-[13rem]">
                {Array.from({ length: 3 }).map((__, actionIndex) => (
                  <Skeleton
                    key={actionIndex}
                    className="h-11 w-full rounded-2xl bg-white/10"
                  />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
