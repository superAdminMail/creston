import { Skeleton } from "@/components/ui/skeleton";

export default function SiteSettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-10 w-64 rounded-xl bg-white/10" />
        <Skeleton className="h-5 w-full max-w-3xl rounded-xl bg-white/10" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[2rem] border border-white/8 bg-[#08101d]/96 p-6"
            >
              <Skeleton className="h-6 w-40 rounded-xl bg-white/10" />
              <Skeleton className="mt-2 h-4 w-full max-w-md rounded-xl bg-white/10" />
              <div className="mt-6 space-y-4">
                <Skeleton className="h-11 w-full rounded-xl bg-white/10" />
                <Skeleton className="h-11 w-full rounded-xl bg-white/10" />
                <Skeleton className="h-28 w-full rounded-2xl bg-white/10" />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/8 bg-[#08101d]/96 p-6">
            <Skeleton className="h-6 w-36 rounded-xl bg-white/10" />
            <Skeleton className="mt-2 h-4 w-full rounded-xl bg-white/10" />
            <Skeleton className="mt-6 h-11 w-full rounded-xl bg-white/10" />
            <Skeleton className="mt-4 h-28 w-full rounded-2xl bg-white/10" />
          </div>
          <div className="rounded-[2rem] border border-white/8 bg-[#08101d]/96 p-6">
            <Skeleton className="h-6 w-40 rounded-xl bg-white/10" />
            <Skeleton className="mt-2 h-4 w-full rounded-xl bg-white/10" />
            <Skeleton className="mt-6 h-24 w-full rounded-2xl bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
