import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="card-premium rounded-[2rem] p-6 sm:p-8">
        <div className="space-y-4">
          <Skeleton className="h-5 w-44 rounded-full bg-white/10" />
          <Skeleton className="h-10 w-72 rounded-2xl bg-white/10" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-20 w-full rounded-2xl bg-white/10"
            />
          ))}
        </div>

        <div className="mt-8 space-y-4">
          <Skeleton className="h-6 w-36 rounded-full bg-white/10" />
          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-28 w-full rounded-2xl bg-white/10"
              />
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="rounded-[2rem] border border-white/8 bg-[#08101d]/96 p-6">
          <Skeleton className="h-6 w-32 rounded-full bg-white/10" />
          <Skeleton className="mt-2 h-4 w-full rounded-full bg-white/10" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-11 w-full rounded-xl bg-white/10" />
            <Skeleton className="h-11 w-full rounded-xl bg-white/10" />
          </div>
        </section>

        <section className="card-premium rounded-[2rem] p-6">
          <Skeleton className="h-6 w-32 rounded-full bg-white/10" />
          <Skeleton className="mt-2 h-4 w-full rounded-full bg-white/10" />
          <Skeleton className="mt-5 h-11 w-full rounded-xl bg-white/10" />
        </section>
      </aside>
    </div>
  );
}
