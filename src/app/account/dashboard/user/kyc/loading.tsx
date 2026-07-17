import { Skeleton } from "@/components/ui/skeleton";

function VerificationCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-4">
          <Skeleton className="h-3.5 w-28 rounded-full bg-white/10" />
          <Skeleton className="h-7 w-48 rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full max-w-md rounded-full bg-white/10" />
            <Skeleton className="h-4 w-full max-w-sm rounded-full bg-white/10" />
          </div>
          <Skeleton className="h-4 w-40 rounded-full bg-white/10" />
        </div>

        <Skeleton className="h-12 w-12 shrink-0 rounded-xl bg-white/10" />
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <Skeleton className="h-3 w-36 rounded-full bg-white/10" />
        <Skeleton className="h-7 w-24 rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-6">
      <header className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-full bg-white/10" />
        <Skeleton className="h-4 w-full max-w-2xl rounded-full bg-white/10" />
      </header>

      <VerificationCardSkeleton />
    </div>
  );
}
