function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 ${className}`}
    >
      <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
      <div className="mt-4 h-8 w-56 animate-pulse rounded bg-white/10" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-white/8" />
      <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-white/8" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-4 w-40 animate-pulse rounded bg-white/8" />
        <div className="mt-4 h-10 w-72 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-white/8" />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} className="p-5" />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    </div>
  );
}
