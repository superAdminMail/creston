import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-10 w-72 rounded-2xl bg-white/10" />
        <Skeleton className="h-5 w-full max-w-3xl rounded-full bg-white/10" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, columnIndex) => (
          <div key={columnIndex} className="space-y-6">
            {Array.from({ length: 3 }).map((__, cardIndex) => (
              <section
                key={cardIndex}
                className="card-premium rounded-[1.75rem] p-5 sm:p-6"
              >
                <Skeleton className="h-6 w-40 rounded-full bg-white/10" />
                <div className="mt-5 space-y-4">
                  {Array.from({ length: 3 }).map((___, fieldIndex) => (
                    <Skeleton
                      key={fieldIndex}
                      className="h-11 w-full rounded-xl bg-white/10"
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
