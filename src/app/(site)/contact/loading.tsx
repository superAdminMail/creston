import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050B1F] px-4 py-16 md:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-20%] h-[30rem] w-[30rem] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[30rem] w-[30rem] rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_40%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl space-y-12">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-3 w-24 rounded-full bg-white/10" />
          <Skeleton className="mx-auto h-10 w-full max-w-2xl rounded-2xl bg-white/10" />
          <Skeleton className="mx-auto h-4 w-full max-w-xl rounded-full bg-white/10" />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
            <Skeleton className="h-6 w-40 rounded-full bg-white/10" />
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-3 w-14 rounded-full bg-white/10" />
                <Skeleton className="h-4 w-40 rounded-full bg-white/10" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-14 rounded-full bg-white/10" />
                <Skeleton className="h-4 w-36 rounded-full bg-white/10" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-14 rounded-full bg-white/10" />
                <Skeleton className="h-4 w-48 rounded-full bg-white/10" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-10 rounded-full bg-white/10" />
                <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
            <Skeleton className="h-6 w-44 rounded-full bg-white/10" />
            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 rounded-full bg-white/10" />
                <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 rounded-full bg-white/10" />
                <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16 rounded-full bg-white/10" />
                <Skeleton className="h-28 w-full rounded-xl bg-white/10" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
            </div>
          </div>
        </div>

        <Skeleton className="mx-auto h-3 w-52 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
