export default function Loading() {
  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="h-7 w-44 rounded-full bg-white/10" />
              <div className="mt-4 h-10 w-56 rounded-2xl bg-white/10" />
              <div className="mt-3 h-16 max-w-3xl rounded-2xl bg-white/5" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-20 rounded-2xl border border-white/10 bg-white/[0.04]" />
              <div className="h-20 rounded-2xl border border-white/10 bg-white/[0.04]" />
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-5">
              <div className="h-3 w-20 rounded-full bg-white/10" />
              <div className="mt-3 h-6 w-64 rounded-2xl bg-white/10" />
              <div className="mt-3 h-12 max-w-3xl rounded-2xl bg-white/5" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-white/10" />
                    <div className="h-7 w-20 rounded-full bg-white/10" />
                  </div>
                  <div className="mt-5 h-4 w-36 rounded-full bg-white/10" />
                  <div className="mt-3 h-12 rounded-2xl bg-white/5" />
                  <div className="mt-4 h-3 w-28 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="mb-5">
                  <div className="h-3 w-16 rounded-full bg-white/10" />
                  <div className="mt-3 h-6 w-52 rounded-2xl bg-white/10" />
                  <div className="mt-3 h-12 max-w-3xl rounded-2xl bg-white/5" />
                </div>

                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((__, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="rounded-2xl border border-white/10 bg-[#091327] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="h-12 flex-1 rounded-2xl bg-white/5" />
                        <div className="h-12 w-24 rounded-2xl bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="h-10 w-40 rounded-full bg-white/10" />
                <div className="mt-5 space-y-4">
                  {Array.from({ length: 3 }).map((__, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="rounded-2xl border border-white/10 bg-[#091327] p-4"
                    >
                      <div className="h-24 rounded-2xl bg-white/5" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
