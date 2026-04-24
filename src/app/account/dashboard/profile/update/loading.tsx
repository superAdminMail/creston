import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050B1F]">
      <div className="absolute inset-0">
        <div className="absolute left-[-8%] top-[-10%] h-72 w-72 rounded-full bg-blue-500/12 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_35%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:rounded-[1.75rem] sm:p-6 lg:rounded-[2rem] lg:p-8">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:gap-5 sm:pb-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:pb-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-28 rounded-full bg-white/10 sm:w-32" />
              <Skeleton className="h-6 w-36 rounded-full bg-white/10 sm:w-40" />
              <Skeleton className="h-8 w-full max-w-[18rem] rounded-full bg-white/10 sm:max-w-[20rem] lg:max-w-[28rem]" />
              <Skeleton className="h-4 w-full max-w-xl rounded-full bg-white/10" />
            </div>

            <Skeleton className="h-12 w-full rounded-2xl bg-white/10 sm:w-52 lg:w-64" />
          </div>

          <div className="mt-5 flex justify-center sm:mt-6 lg:mt-8">
            <div className="w-full max-w-3xl rounded-[1.5rem] border border-white/10 bg-[rgba(15,23,42,0.72)] p-4 sm:rounded-[1.75rem] sm:p-5 lg:p-6">
              <div className="flex flex-col items-center text-center">
                <Skeleton className="h-20 w-20 rounded-full bg-white/10 sm:h-24 sm:w-24 lg:h-28 lg:w-28" />
                <Skeleton className="mt-4 h-6 w-44 rounded-full bg-white/10" />
                <Skeleton className="mt-2 h-4 w-36 rounded-full bg-white/10" />
                <Skeleton className="mt-4 h-7 w-32 rounded-full bg-white/10" />
              </div>

              <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
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
