import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050B1F]">
      <div className="absolute inset-0">
        <div className="absolute left-[-8%] top-[-10%] h-72 w-72 rounded-full bg-blue-500/12 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_35%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-6 lg:p-8">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-5 sm:gap-6 sm:pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
              <Skeleton className="h-6 w-40 rounded-full bg-white/10" />
              <Skeleton className="h-8 w-72 max-w-full rounded-full bg-white/10" />
              <Skeleton className="h-4 w-full max-w-2xl rounded-full bg-white/10" />
            </div>

            <Skeleton className="h-12 w-full rounded-2xl bg-white/10 sm:w-64" />
          </div>

          <div className="mt-6 flex justify-center sm:mt-8">
            <div className="w-full max-w-3xl rounded-[1.75rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-5 sm:p-6">
              <div className="flex flex-col items-center text-center">
                <Skeleton className="h-24 w-24 rounded-full bg-white/10 sm:h-28 sm:w-28" />
                <Skeleton className="mt-4 h-6 w-44 rounded-full bg-white/10" />
                <Skeleton className="mt-2 h-4 w-36 rounded-full bg-white/10" />
                <Skeleton className="mt-4 h-7 w-32 rounded-full bg-white/10" />
              </div>

              <div className="mt-6 space-y-4">
                <Skeleton className="h-10 w-full rounded-2xl bg-white/10" />
                <Skeleton className="h-10 w-full rounded-2xl bg-white/10" />
                <Skeleton className="h-10 w-full rounded-2xl bg-white/10" />
                <Skeleton className="h-10 w-full rounded-2xl bg-white/10" />
                <Skeleton className="h-10 w-3/4 rounded-2xl bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
