import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-72 rounded-2xl bg-white/10" />
      <Skeleton className="h-5 w-full max-w-3xl rounded-full bg-white/10" />
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
        <Skeleton className="h-10 w-60 rounded-2xl bg-white/10" />
        <Skeleton className="mt-4 h-4 w-full max-w-lg rounded-full bg-white/10" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl bg-white/10" />
        </div>
      </div>
    </div>
  );
}
