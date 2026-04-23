export default function Loading() {
  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] bg-[#050B1F]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-blue-500/12 blur-3xl" />
        <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="h-8 w-56 animate-pulse rounded-full bg-white/10" />
              <div className="h-11 w-full max-w-3xl animate-pulse rounded-2xl bg-white/10" />
              <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-white/10" />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="h-12 w-36 animate-pulse rounded-2xl bg-white/10" />
              <div className="h-12 w-40 animate-pulse rounded-2xl bg-white/10" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-[1.85rem] border border-white/10 bg-white/5"
              />
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-4 sm:p-5">
              <div className="h-6 w-56 animate-pulse rounded-full bg-white/10" />
              <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded-full bg-white/10" />

              <div className="mt-5 space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-44 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/[0.04]"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-5">
                <div className="h-6 w-36 animate-pulse rounded-full bg-white/10" />
                <div className="mt-3 h-4 w-full max-w-sm animate-pulse rounded-full bg-white/10" />
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
                <div className="h-5 w-44 animate-pulse rounded-full bg-white/10" />
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-4 w-full animate-pulse rounded-full bg-white/10"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
