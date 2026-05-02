export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.16)] sm:p-6 lg:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-4">
            <div className="h-5 w-40 animate-pulse rounded-full bg-white/10" />
            <div className="h-8 w-56 animate-pulse rounded-2xl bg-white/10" />
            <div className="h-5 w-full max-w-2xl animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="h-11 w-full animate-pulse rounded-2xl bg-white/10 sm:w-44" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.16)] sm:p-6">
          <div className="space-y-4">
            <div className="h-4 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-white/10" />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="h-11 animate-pulse rounded-xl bg-white/10 sm:col-span-2" />
              <div className="h-11 animate-pulse rounded-xl bg-white/10" />
            </div>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="h-11 animate-pulse rounded-xl bg-white/10" />
              <div className="h-11 w-full animate-pulse rounded-xl bg-white/10 sm:w-32" />
            </div>
            <div className="h-16 animate-pulse rounded-2xl bg-white/10" />
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.16)] sm:p-6">
          <div className="space-y-4">
            <div className="h-5 w-36 animate-pulse rounded-full bg-white/10" />
            <div className="h-6 w-48 animate-pulse rounded-2xl bg-white/10" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
              <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
              <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
              <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
            </div>
            <div className="h-16 animate-pulse rounded-2xl bg-white/10" />
          </div>
        </div>
      </section>
    </main>
  );
}
