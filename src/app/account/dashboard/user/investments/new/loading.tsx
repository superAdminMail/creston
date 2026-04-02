import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-5 w-40 rounded-full bg-white/10" />
        <Skeleton className="h-10 w-72 rounded-2xl bg-white/10" />
        <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
      </div>

      <section className="card-premium rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl border border-white/8 bg-white/[0.03] p-4"
            >
              <Skeleton className="h-3 w-16 rounded-full bg-white/10" />
              <Skeleton className="mt-4 h-5 w-24 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="card-premium rounded-[2rem] p-6 sm:p-8">
          <Skeleton className="h-8 w-56 rounded-full bg-white/10" />
          <Skeleton className="mt-3 h-5 w-full max-w-2xl rounded-full bg-white/10" />

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5"
              >
                <Skeleton className="h-5 w-32 rounded-full bg-white/10" />
                <Skeleton className="mt-4 h-4 w-full rounded-full bg-white/10" />
                <Skeleton className="mt-2 h-4 w-4/5 rounded-full bg-white/10" />
                <Skeleton className="mt-5 h-10 w-32 rounded-2xl bg-white/10" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="glass-strong rounded-[2rem] p-6">
            <Skeleton className="h-6 w-44 rounded-full bg-white/10" />
            <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
            <Skeleton className="mt-2 h-4 w-4/5 rounded-full bg-white/10" />

            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                >
                  <Skeleton className="h-4 w-40 rounded-full bg-white/10" />
                  <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          </section>

          <section className="card-premium rounded-[2rem] p-6">
            <Skeleton className="h-6 w-40 rounded-full bg-white/10" />
            <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
            <Skeleton className="mt-2 h-4 w-3/4 rounded-full bg-white/10" />
            <Skeleton className="mt-6 h-12 w-full rounded-2xl bg-white/10" />
          </section>
        </div>
      </section>
    </div>
  );
}
