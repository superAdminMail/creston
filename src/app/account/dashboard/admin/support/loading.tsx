export default function Loading() {
  return (
    <div className="mx-auto min-h-[calc(100dvh-7rem)] max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="card-premium rounded-[2rem] p-6 sm:p-8">
          <div className="h-4 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="mt-4 h-8 w-80 animate-pulse rounded-2xl bg-white/10" />
          <div className="mt-3 h-4 w-full max-w-3xl animate-pulse rounded-full bg-white/10" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="rounded-[1.9rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="h-11 animate-pulse rounded-2xl bg-white/10" />
            <div className="mt-4 space-y-3">
              <div className="h-24 animate-pulse rounded-[1.5rem] bg-white/10" />
              <div className="h-24 animate-pulse rounded-[1.5rem] bg-white/10" />
              <div className="h-24 animate-pulse rounded-[1.5rem] bg-white/10" />
            </div>
          </div>

          <div className="rounded-[1.9rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="h-[38rem] animate-pulse rounded-[1.5rem] bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
