export default function Loading() {
  return (
    <div className="mx-auto min-h-[calc(100dvh-7rem)] max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="card-premium rounded-[2rem] p-6 sm:p-8">
          <div className="h-10 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="mt-5 h-10 w-3/4 animate-pulse rounded-2xl bg-white/10" />
          <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-5">
            <div className="h-[32rem] animate-pulse rounded-[1.5rem] bg-white/5" />
          </div>
          <div className="rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-5">
            <div className="h-[32rem] animate-pulse rounded-[1.5rem] bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
