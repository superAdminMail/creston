import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <section className="card-premium rounded-[2rem] p-6 sm:p-8">
        <div className="space-y-3">
          <Skeleton className="h-10 w-52 rounded-full" />
          <Skeleton className="h-5 w-full max-w-3xl rounded-full" />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-28 rounded-[1.85rem]" />
        <Skeleton className="h-28 rounded-[1.85rem]" />
        <Skeleton className="h-28 rounded-[1.85rem]" />
        <Skeleton className="h-28 rounded-[1.85rem]" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Skeleton className="h-[34rem] rounded-[1.9rem]" />
        <Skeleton className="h-[34rem] rounded-[1.9rem]" />
      </section>
    </div>
  );
}
