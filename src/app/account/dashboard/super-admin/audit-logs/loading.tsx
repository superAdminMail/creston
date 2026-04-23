export default function Loading() {
  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-[#071120] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:p-5 md:p-8">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="h-7 w-44 rounded-full bg-white/10" />
              <div className="mt-4 h-10 w-56 rounded-2xl bg-white/10" />
              <div className="mt-3 h-16 max-w-3xl rounded-2xl bg-white/5" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:min-w-[340px] lg:max-w-[420px]">
              <div className="h-20 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur" />
              <div className="h-20 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur" />
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="h-28 rounded-[1.85rem] border border-white/10 bg-[#071120]" />
            <div className="h-28 rounded-[1.85rem] border border-white/10 bg-[#071120]" />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="h-28 rounded-[1.75rem] border border-white/10 bg-[#071120]" />
            <div className="h-28 rounded-[1.75rem] border border-white/10 bg-[#071120]" />
          </div>

          <div className="mt-8 space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.75rem] border border-white/10 bg-[#071120] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:p-5"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-white/10" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="h-4 w-44 rounded-full bg-white/10" />
                        <div className="h-6 w-24 rounded-full bg-white/10" />
                        <div className="h-6 w-24 rounded-full bg-white/10" />
                      </div>
                      <div className="mt-3 h-4 max-w-3xl rounded-full bg-white/10" />
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((__, detailIndex) => (
                          <div
                            key={detailIndex}
                            className="h-20 rounded-2xl border border-white/10 bg-[#091327]"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="h-52 w-full rounded-2xl border border-white/10 bg-[#091327] xl:w-[300px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
