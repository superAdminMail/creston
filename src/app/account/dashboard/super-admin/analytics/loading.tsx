import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function MetricSkeleton() {
  return (
    <Card className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-10 w-10 rounded-2xl bg-white/10" />
          <Skeleton className="h-7 w-16 rounded-full bg-white/10" />
        </div>
        <Skeleton className="mt-4 h-4 w-32 bg-white/10" />
        <Skeleton className="mt-2 h-8 w-28 bg-white/10" />
        <Skeleton className="mt-3 h-4 w-full bg-white/10" />
      </CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <Card className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_30%),linear-gradient(135deg,rgba(7,17,32,0.98),rgba(8,18,36,0.98))] text-white shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <Skeleton className="h-7 w-52 rounded-full bg-white/10" />
                <Skeleton className="h-10 w-full max-w-md bg-white/10" />
                <Skeleton className="h-16 w-full max-w-2xl bg-white/10" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-40 rounded-full bg-white/10" />
                  <Skeleton className="h-8 w-32 rounded-full bg-white/10" />
                  <Skeleton className="h-8 w-36 rounded-full bg-white/10" />
                </div>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl">
                <Skeleton className="h-28 rounded-[1.5rem] bg-white/10" />
                <Skeleton className="h-28 rounded-[1.5rem] bg-white/10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Skeleton className="h-4 w-28 bg-white/10" />
          <Skeleton className="mt-2 h-7 w-64 bg-white/10" />
          <Skeleton className="mt-2 h-5 w-full max-w-3xl bg-white/10" />

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <MetricSkeleton key={index} />
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
            <CardHeader className="space-y-2 border-b border-white/8 px-4 py-4 sm:px-6 sm:py-5">
              <CardTitle className="text-base sm:text-lg">
                <Skeleton className="h-5 w-40 bg-white/10" />
              </CardTitle>
              <Skeleton className="h-4 w-full max-w-xl bg-white/10" />
            </CardHeader>
            <CardContent className="px-4 py-4 sm:px-6 sm:py-5">
              <Skeleton className="h-[280px] w-full rounded-[1.5rem] bg-white/10 sm:h-[320px] lg:h-[360px]" />
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
            <CardHeader className="space-y-2 border-b border-white/8 px-4 py-4 sm:px-6 sm:py-5">
              <CardTitle className="text-base sm:text-lg">
                <Skeleton className="h-5 w-36 bg-white/10" />
              </CardTitle>
              <Skeleton className="h-4 w-full max-w-lg bg-white/10" />
            </CardHeader>
            <CardContent className="px-4 py-4 sm:px-6 sm:py-5">
              <Skeleton className="h-[280px] w-full rounded-[1.5rem] bg-white/10 sm:h-[320px] lg:h-[360px]" />
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
            <CardHeader className="space-y-2 border-b border-white/8 px-4 py-4 sm:px-6 sm:py-5">
              <CardTitle className="text-base sm:text-lg">
                <Skeleton className="h-5 w-36 bg-white/10" />
              </CardTitle>
              <Skeleton className="h-4 w-full max-w-lg bg-white/10" />
            </CardHeader>
            <CardContent className="space-y-3 px-4 py-4 sm:px-6 sm:py-5">
              <Skeleton className="h-[220px] w-full rounded-[1.5rem] bg-white/10 sm:h-[260px]" />
              <Skeleton className="h-14 w-full bg-white/10" />
              <Skeleton className="h-14 w-full bg-white/10" />
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <CardHeader className="border-b border-white/8 px-4 py-4 sm:px-6 sm:py-5">
              <CardTitle className="text-base sm:text-lg">
                <Skeleton className="h-5 w-40 bg-white/10" />
              </CardTitle>
              <Skeleton className="mt-2 h-4 w-full max-w-xl bg-white/10" />
            </CardHeader>
            <CardContent className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 sm:py-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-2xl bg-white/10" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
