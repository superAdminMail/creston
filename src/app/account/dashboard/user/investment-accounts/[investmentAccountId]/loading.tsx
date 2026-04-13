import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
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
              <Skeleton className="h-10 w-24 rounded-2xl" />
            </div>
          </div>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
            <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
              <Skeleton className="h-6 w-52 rounded-full" />
              <Skeleton className="mt-3 h-4 w-full max-w-2xl rounded-full" />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 rounded-2xl" />
                ))}
              </div>
            </section>

            <div className="space-y-6">
              <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
                <Skeleton className="h-5 w-32 rounded-full" />
                <div className="mt-5 space-y-3">
                  <Skeleton className="h-12 rounded-2xl" />
                  <Skeleton className="h-12 rounded-2xl" />
                  <Skeleton className="h-12 rounded-2xl" />
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
                <Skeleton className="h-5 w-36 rounded-full" />
                <Skeleton className="mt-3 h-4 w-full rounded-full" />
                <Skeleton className="mt-2 h-4 w-3/4 rounded-full" />
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
