import { Card, CardContent } from "@/components/ui/card";
import { DashboardSectionCard } from "../../_components/DashboardSectionCard";

function SkeletonBar({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-white/10 ${className}`} />;
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <DashboardSectionCard>
        <SkeletonBar className="h-4 w-24" />
        <div className="mt-4 space-y-3">
          <SkeletonBar className="h-10 w-72 max-w-full" />
          <SkeletonBar className="h-4 w-full max-w-3xl" />
          <SkeletonBar className="h-4 w-5/6 max-w-2xl" />
        </div>
      </DashboardSectionCard>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="rounded-[1.85rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,17,37,0.98))] shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
          >
            <CardContent className="space-y-3 p-5">
              <SkeletonBar className="h-3 w-32" />
              <SkeletonBar className="h-8 w-24" />
              <SkeletonBar className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,17,37,0.99))] text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4"
              >
                <SkeletonBar className="h-4 w-36" />
                <SkeletonBar className="mt-3 h-3 w-52 max-w-full" />
                <SkeletonBar className="mt-2 h-3 w-40 max-w-full" />
                <SkeletonBar className="mt-4 h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
