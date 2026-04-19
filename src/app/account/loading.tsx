import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="fixed inset-0 z-[80] overflow-hidden bg-[#050b17] text-slate-950 dark:text-slate-100">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-blue-500/10" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div className="relative flex h-full flex-col">
        <div className="border-b border-slate-200/70 bg-white/86 backdrop-blur-xl dark:border-white/10 dark:bg-[#08111d]/88">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-28 rounded-full" />
                <Skeleton className="h-3 w-20 rounded-full" />
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <Skeleton className="h-10 w-10 rounded-2xl" />
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden md:pl-72">
          <aside className="fixed left-0 top-16 z-30 hidden h-[calc(100dvh-4rem)] w-72 md:block">
            <div className="h-full px-4 py-4">
              <div className="h-full rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-3 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
                <div className="space-y-4">
                  <div className="rounded-[1.35rem] border border-slate-200/80 bg-white/75 px-3 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="mt-2 h-4 w-32 rounded-full" />
                  </div>

                  <div className="space-y-3">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full rounded-2xl" />
                      <Skeleton className="h-12 w-full rounded-2xl" />
                      <Skeleton className="h-12 w-full rounded-2xl" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Skeleton className="h-8 w-28 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full rounded-2xl" />
                      <Skeleton className="h-12 w-full rounded-2xl" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Skeleton className="h-11 w-full rounded-2xl" />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            <div className="space-y-6">
              <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-2xl" />
                    <div className="min-w-0 space-y-2">
                      <Skeleton className="h-5 w-40 rounded-full" />
                      <Skeleton className="h-4 w-64 max-w-full rounded-full" />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-16 rounded-2xl" />
                    <Skeleton className="h-16 rounded-2xl" />
                    <Skeleton className="h-16 rounded-2xl" />
                    <Skeleton className="h-16 rounded-2xl" />
                  </div>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
                <div className="space-y-6">
                  <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
                    <Skeleton className="h-5 w-36 rounded-full" />
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <Skeleton className="h-24 rounded-2xl" />
                      <Skeleton className="h-24 rounded-2xl" />
                      <Skeleton className="h-24 rounded-2xl" />
                      <Skeleton className="h-24 rounded-2xl" />
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
                    <Skeleton className="h-5 w-44 rounded-full" />
                    <div className="mt-5 space-y-3">
                      <Skeleton className="h-4 w-full rounded-full" />
                      <Skeleton className="h-4 w-11/12 rounded-full" />
                      <Skeleton className="h-4 w-10/12 rounded-full" />
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <Skeleton className="h-12 rounded-2xl" />
                      <Skeleton className="h-12 rounded-2xl" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
                    <Skeleton className="h-5 w-28 rounded-full" />
                    <div className="mt-5 space-y-3">
                      <Skeleton className="h-12 rounded-2xl" />
                      <Skeleton className="h-12 rounded-2xl" />
                      <Skeleton className="h-12 rounded-2xl" />
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
                    <Skeleton className="h-5 w-32 rounded-full" />
                    <div className="mt-5 space-y-3">
                      <Skeleton className="h-10 w-full rounded-2xl" />
                      <Skeleton className="h-10 w-full rounded-2xl" />
                      <Skeleton className="h-10 w-3/4 rounded-2xl" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
