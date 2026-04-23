import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatSkeleton() {
  return (
    <Card className="rounded-[1.85rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,17,37,0.98))] shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <CardContent className="space-y-2 p-5">
        <Skeleton className="h-4 w-24 bg-white/10" />
        <Skeleton className="h-8 w-20 bg-white/10" />
        <Skeleton className="h-4 w-32 bg-white/10" />
      </CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36 bg-white/10" />
        <Skeleton className="h-10 w-full max-w-md bg-white/10" />
        <Skeleton className="h-5 w-full max-w-2xl bg-white/10" />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <StatSkeleton key={index} />
        ))}
      </section>

      <div className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-6">
        <div className="mb-4 space-y-2">
          <Skeleton className="h-4 w-44 bg-white/10" />
          <Skeleton className="h-7 w-64 bg-white/10" />
          <Skeleton className="h-5 w-full max-w-2xl bg-white/10" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
            >
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-40 bg-white/10" />
                  <Skeleton className="h-4 w-56 bg-white/10" />
                </div>
                <Skeleton className="h-9 w-24 rounded-full bg-white/10" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
