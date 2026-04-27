import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="card-premium rounded-[2rem] p-6 sm:p-8">
        <div className="space-y-4">
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="h-8 w-56 rounded-2xl" />
          <Skeleton className="h-5 w-full max-w-3xl rounded-xl" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[34rem]">
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-28 rounded-[1.75rem]" />
        <Skeleton className="h-28 rounded-[1.75rem]" />
        <Skeleton className="h-28 rounded-[1.75rem]" />
      </section>

      <section className="card-premium rounded-[2rem] p-6 sm:p-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="h-7 w-64 rounded-2xl" />
              <Skeleton className="h-5 w-full max-w-2xl rounded-xl" />
            </div>
            <Skeleton className="h-12 w-full rounded-2xl sm:w-[340px]" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Skeleton className="min-h-[360px] rounded-[1.75rem]" />
            <Skeleton className="min-h-[360px] rounded-[1.75rem]" />
          </div>
        </div>
      </section>
    </main>
  );
}
