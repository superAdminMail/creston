import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-10 w-72 rounded-2xl bg-white/10" />
        <Skeleton className="h-5 w-full max-w-3xl rounded-full bg-white/10" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
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
