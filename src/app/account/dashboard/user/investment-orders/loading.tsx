import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-5 w-40 rounded-full bg-white/10" />
        <Skeleton className="h-10 w-72 rounded-2xl bg-white/10" />
        <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
      </div>

      <section className="card-premium overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl border border-white/8 bg-white/[0.03] p-4"
            >
              <Skeleton className="h-3 w-20 rounded-full bg-white/10" />
              <Skeleton className="mt-4 h-8 w-16 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <section
            key={index}
            className="card-premium overflow-hidden rounded-[1.75rem] p-5 sm:p-6 lg:p-7"
          >
            <Skeleton className="h-6 w-full max-w-52 rounded-full bg-white/10" />
            <Skeleton className="mt-3 h-4 w-4/5 rounded-full bg-white/10" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((__, statIndex) => (
                <div
                  key={statIndex}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                >
                  <Skeleton className="h-3 w-16 rounded-full bg-white/10" />
                  <Skeleton className="mt-3 h-5 w-24 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
