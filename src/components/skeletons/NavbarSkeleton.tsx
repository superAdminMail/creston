import { Skeleton } from "@/components/ui/skeleton";

export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-[80] w-full px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[calc(var(--radius)*1.5)] border border-white/10 bg-[linear-gradient(180deg,rgba(8,17,37,0.96),rgba(5,11,31,0.985))] shadow-[0_22px_55px_rgba(0,0,0,0.34)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(96,165,250,0.44),transparent)]" />

          <div className="absolute inset-x-6 top-[72px] hidden h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),rgba(96,165,250,0.16),rgba(255,255,255,0.08),transparent)] lg:block" />

          <div className="flex min-h-[72px] items-center gap-3 px-4 sm:px-5 lg:px-6">
            <div className="flex min-w-0 flex-1 items-center">
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-[1.35rem] border border-white/12 bg-white/10" />

                <div className="flex min-w-0 flex-col space-y-2">
                  <Skeleton className="h-4 w-28 bg-white/10 sm:h-5 sm:w-36" />
                  <Skeleton className="hidden h-3 w-24 bg-white/10 sm:block" />
                </div>
              </div>
            </div>

            <div className="hidden flex-1 items-center justify-end lg:flex">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-24 rounded-full bg-white/10" />
                <Skeleton className="h-10 w-28 rounded-full bg-white/10" />
              </div>
            </div>

            <Skeleton className="h-11 w-11 rounded-2xl border border-white/10 bg-white/10 lg:hidden" />
          </div>

          <div className="hidden lg:block">
            <div className="flex items-center justify-center px-6 pb-3 pt-2">
              <div className="flex items-center gap-1 rounded-full border border-white/6 bg-white/[0.025] px-2 py-1.5">
                <Skeleton className="h-[38px] w-[120px] rounded-full bg-white/10" />
                <Skeleton className="h-[38px] w-[120px] rounded-full bg-white/10" />
                <Skeleton className="h-[38px] w-[98px] rounded-full bg-white/10" />
                <Skeleton className="h-[38px] w-[118px] rounded-full bg-white/10" />
                <Skeleton className="h-[38px] w-[72px] rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
