import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 rounded-full bg-white/10" />
        <Skeleton className="mt-3 h-5 w-full max-w-2xl rounded-full bg-white/10" />
      </div>

      <section className="rounded-[2rem] border border-white/8 bg-[#08101d]/96 p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-11 w-full rounded-xl bg-white/10"
            />
          ))}
        </div>
        <Skeleton className="mt-6 h-28 w-full rounded-2xl bg-white/10" />
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-11 w-32 rounded-xl bg-white/10" />
          <Skeleton className="h-11 w-32 rounded-xl bg-white/10" />
        </div>
      </section>
    </div>
  );
}
