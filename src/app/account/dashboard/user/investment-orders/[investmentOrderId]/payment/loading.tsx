import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto min-h-[calc(100dvh-7rem)] max-w-6xl px-4 py-6 md:px-6">
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
    </div>
  );
}
