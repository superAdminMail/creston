import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur xl:px-10 xl:py-10">
        <div className="max-w-3xl space-y-4">
          <Skeleton className="h-7 w-32 rounded-full bg-white/10" />
          <Skeleton className="h-11 w-full max-w-2xl rounded-2xl bg-white/10" />
          <Skeleton className="h-4 w-full max-w-xl rounded-full bg-white/10" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <article
            key={index}
            className="flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_34%),#0b1120] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-14 w-14 rounded-2xl bg-white/10" />
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-7 w-20 rounded-full bg-white/10" />
                    <Skeleton className="h-7 w-24 rounded-full bg-white/10" />
                  </div>
                  <Skeleton className="h-6 w-40 rounded-full bg-white/10" />
                </div>
              </div>

              <Skeleton className="hidden h-8 w-20 rounded-full bg-white/10" />
            </div>

            <div className="mt-5 space-y-3">
              <Skeleton className="h-4 w-full rounded-full bg-white/10" />
              <Skeleton className="h-4 w-11/12 rounded-full bg-white/10" />
              <Skeleton className="h-4 w-4/5 rounded-full bg-white/10" />
            </div>

            <div className="mt-6 grid gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 rounded-full bg-white/10" />
                <Skeleton className="h-4 w-28 rounded-full bg-white/10" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 rounded-full bg-white/10" />
                <Skeleton className="h-4 w-24 rounded-full bg-white/10" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Skeleton className="h-11 w-36 rounded-2xl bg-white/10" />
              <Skeleton className="h-11 w-36 rounded-2xl bg-white/10" />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
