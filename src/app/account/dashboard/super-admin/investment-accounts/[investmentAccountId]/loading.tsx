import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-5 w-40 rounded-full bg-white/10" />
        <Skeleton className="h-10 w-80 rounded-2xl bg-white/10" />
        <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-24 w-full rounded-3xl bg-white/10"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Skeleton className="h-80 w-full rounded-[2rem] bg-white/10" />
          <Skeleton className="h-72 w-full rounded-[2rem] bg-white/10" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-[2rem] bg-white/10" />
          <Skeleton className="h-64 w-full rounded-[2rem] bg-white/10" />
        </div>
      </div>
    </div>
  );
}
