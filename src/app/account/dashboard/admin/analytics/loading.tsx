export default function Loading() {
  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.16)]">
        <div className="h-4 w-44 animate-pulse rounded-full bg-white/10" />
        <div className="mt-4 h-10 w-80 animate-pulse rounded-2xl bg-white/10" />
        <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded-full bg-white/10" />
        <div className="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-white/10" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-[1.75rem] border border-white/10 bg-white/[0.04]"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="h-[420px] animate-pulse rounded-[1.85rem] border border-white/10 bg-white/[0.04] xl:col-span-8" />
        <div className="h-[420px] animate-pulse rounded-[1.85rem] border border-white/10 bg-white/[0.04] xl:col-span-4" />
      </div>

      <div className="h-[420px] animate-pulse rounded-[1.85rem] border border-white/10 bg-white/[0.04]" />
    </div>
  );
}
