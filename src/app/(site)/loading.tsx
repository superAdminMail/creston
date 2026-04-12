import { Skeleton } from "@/components/ui/skeleton";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

function SectionSkeleton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={className}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(8,17,37,0.94))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
      <Skeleton className="h-12 w-12 rounded-2xl bg-white/10" />
      <Skeleton className="mt-5 h-5 w-3/5 bg-white/10" />
      <Skeleton className="mt-3 h-4 w-full bg-white/10" />
      <Skeleton className="mt-2 h-4 w-11/12 bg-white/10" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Skeleton className="h-14 rounded-2xl bg-white/10" />
        <Skeleton className="h-14 rounded-2xl bg-white/10" />
      </div>
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-11 w-32 rounded-2xl bg-white/10" />
        <Skeleton className="h-11 w-28 rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}

export default async function Loading() {
  const config = await getSiteConfigurationCached();
  const siteName = config?.siteName?.trim() || "Havenstone";

  return (
    <div className="bg-site-shell min-h-screen overflow-hidden text-white">
      <SectionSkeleton className="py-6 sm:py-8">
        <div className="rounded-[calc(var(--radius)*1.5)] border border-white/10 bg-[linear-gradient(180deg,rgba(8,17,37,0.96),rgba(5,11,31,0.985))] px-4 py-4 shadow-[0_22px_55px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:px-5 lg:px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-[1.35rem] bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 bg-white/10" />
              <Skeleton className="h-3 w-28 bg-white/10" />
            </div>
          </div>
        </div>
      </SectionSkeleton>

      <SectionSkeleton className="py-8 sm:py-12">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div className="space-y-6">
            <Skeleton className="h-9 w-56 rounded-full bg-white/10" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-full bg-white/10" />
              <Skeleton className="h-12 w-4/5 bg-white/10" />
            </div>
            <Skeleton className="h-6 w-11/12 bg-white/10" />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-12 w-40 rounded-2xl bg-white/10" />
              <Skeleton className="h-12 w-36 rounded-2xl bg-white/10" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-24 rounded-2xl bg-white/10" />
              <Skeleton className="h-24 rounded-2xl bg-white/10" />
              <Skeleton className="h-24 rounded-2xl bg-white/10" />
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-white/10 bg-[rgba(15,23,42,0.9)] p-5 shadow-xl backdrop-blur-xl sm:p-6">
              <Skeleton className="h-14 rounded-xl bg-white/10" />
              <Skeleton className="mt-5 h-10 w-1/2 bg-white/10" />
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Skeleton className="h-16 rounded-xl bg-white/10" />
                <Skeleton className="h-16 rounded-xl bg-white/10" />
                <Skeleton className="h-16 rounded-xl bg-white/10" />
                <Skeleton className="h-16 rounded-xl bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </SectionSkeleton>

      <SectionSkeleton className="py-8 sm:py-12">
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-40 bg-white/10" />
            <Skeleton className="h-10 w-72 bg-white/10" />
            <Skeleton className="h-6 w-4/5 bg-white/10" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </SectionSkeleton>

      <SectionSkeleton className="py-8 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[320px] rounded-[2rem] bg-white/10" />
          <Skeleton className="h-[320px] rounded-[2rem] bg-white/10" />
        </div>
      </SectionSkeleton>

      <SectionSkeleton className="py-8 sm:py-12 pb-16">
        <div className="rounded-[2rem] border border-white/10 bg-[#0b1120]/90 p-8">
          <Skeleton className="h-5 w-40 bg-white/10" />
          <Skeleton className="mt-4 h-10 w-3/5 bg-white/10" />
          <Skeleton className="mt-4 h-5 w-4/5 bg-white/10" />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-11 w-40 rounded-2xl bg-white/10" />
            <Skeleton className="h-11 w-36 rounded-2xl bg-white/10" />
          </div>
        </div>
      </SectionSkeleton>

      <div className="sr-only">{siteName}</div>
    </div>
  );
}
