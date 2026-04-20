import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-2xl items-center px-4 py-10 md:px-6">
      <div className="w-full rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]">
        <Skeleton className="h-8 w-36 rounded-full" />
        <div className="mt-5 space-y-3">
          <Skeleton className="h-5 w-3/4 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-11/12 rounded-full" />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>

        <div className="mt-6 flex gap-3">
          <Skeleton className="h-11 w-40 rounded-full" />
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>
      </div>
    </main>
  );
}
