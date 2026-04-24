import { Skeleton } from "@/components/ui/skeleton";

function ProfileHeaderSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-6 lg:p-8">
      <div className="flex flex-col gap-5 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:pb-6">
        <div className="min-w-0 space-y-4">
          <Skeleton className="h-6 w-36 rounded-full bg-white/10" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-56 rounded-full bg-white/10 sm:h-10 sm:w-72" />
            <Skeleton className="h-4 w-full max-w-2xl rounded-full bg-white/10" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-end">
          <Skeleton className="h-12 w-full rounded-2xl bg-white/10 sm:w-44" />
          <Skeleton className="h-12 w-full rounded-2xl bg-white/10 sm:w-52" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:mt-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:gap-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-4 sm:rounded-[1.75rem] sm:p-6">
            <div className="flex flex-col items-center text-center">
              <Skeleton className="h-24 w-24 rounded-full bg-white/10 sm:h-28 sm:w-28" />
              <Skeleton className="mt-4 h-6 w-40 rounded-full bg-white/10" />
              <Skeleton className="mt-2 h-4 w-32 rounded-full bg-white/10" />
              <Skeleton className="mt-4 h-7 w-32 rounded-full bg-white/10" />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-4 sm:rounded-[1.75rem] sm:p-6">
            <Skeleton className="h-5 w-40 rounded-full bg-white/10" />
            <Skeleton className="mt-2 h-4 w-72 max-w-full rounded-full bg-white/10" />

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-2xl bg-white/10" />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-4 sm:rounded-[1.75rem] sm:p-6">
            <Skeleton className="h-5 w-28 rounded-full bg-white/10" />
            <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
            <Skeleton className="mt-2 h-4 w-11/12 rounded-full bg-white/10" />
            <Skeleton className="mt-5 h-12 w-full rounded-2xl bg-white/10" />
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-4 sm:rounded-[1.75rem] sm:p-6">
            <Skeleton className="h-5 w-36 rounded-full bg-white/10" />
            <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
            <Skeleton className="mt-2 h-4 w-10/12 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050B1F]">
      <div className="absolute inset-0">
        <div className="absolute left-[-8%] top-[-10%] h-72 w-72 rounded-full bg-blue-500/12 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_35%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <ProfileHeaderSkeleton />
      </div>
    </div>
  );
}
