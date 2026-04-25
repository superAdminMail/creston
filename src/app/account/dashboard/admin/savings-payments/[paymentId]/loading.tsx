import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-9 w-72 max-w-full rounded-2xl" />
            <Skeleton className="h-4 w-full max-w-2xl rounded-full" />
            <Skeleton className="h-4 w-5/6 max-w-xl rounded-full" />
          </div>
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
        <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-xl sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-24 rounded-[1.5rem]" />
            <Skeleton className="h-24 rounded-[1.5rem]" />
            <Skeleton className="h-24 rounded-[1.5rem]" />
            <Skeleton className="h-24 rounded-[1.5rem]" />
          </div>
          <Skeleton className="h-28 rounded-[1.5rem]" />
          <Skeleton className="h-20 rounded-[1.5rem]" />
        </div>

        <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-xl sm:p-6">
          <Skeleton className="h-5 w-40 rounded-full" />
          <div className="space-y-4">
            <Skeleton className="h-16 rounded-[1.5rem]" />
            <Skeleton className="h-16 rounded-[1.5rem]" />
            <Skeleton className="h-16 rounded-[1.5rem]" />
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
