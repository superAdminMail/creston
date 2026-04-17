export default function Loading() {
  return (
    <div className="mx-auto min-h-[calc(100dvh-7rem)] max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <section className="card-premium rounded-[2rem] p-6 sm:p-8">
          <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
          <div className="mt-4 h-8 w-72 animate-pulse rounded-2xl bg-white/10" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded-full bg-white/10" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,17,37,0.98))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded-full bg-white/10" />
              <div className="h-4 w-20 animate-pulse rounded-full bg-white/10" />
            </div>

            <div className="mt-4 space-y-3">
              <div className="relative">
                <div className="h-11 animate-pulse rounded-2xl bg-white/10" />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="h-8 w-16 animate-pulse rounded-full bg-white/10" />
                <div className="h-8 w-20 animate-pulse rounded-full bg-white/10" />
                <div className="h-8 w-20 animate-pulse rounded-full bg-white/10" />
                <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
              </div>
              <div className="space-y-3 pt-2">
                <div className="h-24 animate-pulse rounded-[1.5rem] bg-white/10" />
                <div className="h-24 animate-pulse rounded-[1.5rem] bg-white/10" />
                <div className="h-24 animate-pulse rounded-[1.5rem] bg-white/10" />
              </div>
            </div>
          </div>

          <div className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,17,37,0.98))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
            <div className="space-y-4">
              <div className="h-4 w-28 animate-pulse rounded-full bg-white/10" />
              <div className="h-16 animate-pulse rounded-[1.4rem] bg-white/10" />
              <div className="h-32 animate-pulse rounded-[1.4rem] bg-white/10" />
              <div className="h-24 animate-pulse rounded-[1.4rem] bg-white/10" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
