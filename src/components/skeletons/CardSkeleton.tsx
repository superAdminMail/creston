import { Skeleton } from "../ui/skeleton";

type CardSkeletonVariant =
  | "product"
  | "plan"
  | "testimonial"
  | "faq"
  | "management"
  | "how-step"
  | "benefit-primary"
  | "benefit-secondary"
  | "cta";

type CardSkeletonProps = {
  variant?: CardSkeletonVariant;
  className?: string;
};

function CardShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] shadow-[0_24px_60px_rgba(0,0,0,0.24)] ${className}`}
    >
      {children}
    </div>
  );
}

export default function CardSkeleton({
  variant = "plan",
  className = "",
}: CardSkeletonProps) {
  if (variant === "testimonial") {
    return (
      <CardShell className={`p-7 ${className}`}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 bg-white/10" />
            <Skeleton className="h-3 w-20 bg-white/10" />
          </div>
        </div>
        <Skeleton className="mt-6 h-28 w-full bg-white/10" />
        <div className="mt-8 border-t border-white/8 pt-5">
          <Skeleton className="h-4 w-24 bg-white/10" />
        </div>
      </CardShell>
    );
  }

  if (variant === "faq") {
    return (
      <div className={`rounded-[1.7rem] border border-white/8 bg-white/[0.04] p-5 ${className}`}>
        <Skeleton className="h-5 w-2/3 bg-white/10" />
        <Skeleton className="mt-3 h-4 w-full bg-white/10" />
        <Skeleton className="mt-2 h-4 w-11/12 bg-white/10" />
      </div>
    );
  }

  if (variant === "management") {
    return (
      <div
        className={`relative w-[260px] rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,30,0.96),rgba(5,11,24,1))] p-5 text-center shadow-[0_24px_60px_rgba(0,0,0,0.24)] sm:w-[300px] sm:p-6 ${className}`}
      >
        <Skeleton className="mx-auto h-16 w-16 rounded-full bg-white/10 sm:h-20 sm:w-20" />
        <Skeleton className="mx-auto mt-4 h-5 w-28 bg-white/10 sm:mt-5 sm:w-32" />
        <Skeleton className="mx-auto mt-2 h-4 w-20 bg-white/10" />
        <Skeleton className="mt-3 h-4 w-full bg-white/10" />
        <Skeleton className="mt-2 h-4 w-11/12 bg-white/10" />
      </div>
    );
  }

  if (variant === "how-step") {
    return (
      <div
        className={`rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-6 shadow-sm ${className}`}
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16 bg-white/10" />
          <Skeleton className="h-10 w-10 rounded-2xl bg-white/10" />
        </div>
        <Skeleton className="mt-6 h-6 w-3/5 bg-white/10" />
        <Skeleton className="mt-3 h-4 w-full bg-white/10" />
        <Skeleton className="mt-2 h-4 w-11/12 bg-white/10" />
      </div>
    );
  }

  if (variant === "benefit-primary") {
    return (
      <CardShell className={`p-7 ${className}`}>
        <div className="flex justify-between gap-4">
          <Skeleton className="h-11 w-11 rounded-2xl bg-white/10" />
          <div className="flex-1">
            <Skeleton className="h-5 w-40 bg-white/10" />
            <Skeleton className="mt-3 h-4 w-full bg-white/10" />
            <Skeleton className="mt-2 h-4 w-11/12 bg-white/10" />
          </div>
        </div>
        <Skeleton className="mt-6 h-28 w-full rounded-[1.7rem] bg-white/10" />
      </CardShell>
    );
  }

  if (variant === "benefit-secondary") {
    return (
      <div
        className={`rounded-[1.7rem] border border-white/8 bg-white/[0.04] p-5 ${className}`}
      >
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 bg-white/10" />
            <Skeleton className="mt-2 h-4 w-full bg-white/10" />
            <Skeleton className="mt-2 h-4 w-11/12 bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "cta") {
    return (
      <div className={`rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 ${className}`}>
        <Skeleton className="h-4 w-28 bg-white/10" />
        <Skeleton className="mt-4 h-9 w-3/5 bg-white/10" />
        <Skeleton className="mt-4 h-4 w-5/6 bg-white/10" />
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-11 w-36 rounded-2xl bg-white/10" />
          <Skeleton className="h-11 w-36 rounded-2xl bg-white/10" />
        </div>
      </div>
    );
  }

  if (variant === "product") {
    return (
      <CardShell className={`p-6 ${className}`}>
        <Skeleton className="h-12 w-12 rounded-2xl bg-white/10" />
        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-28 bg-white/10" />
            <Skeleton className="mt-2 h-6 w-3/5 bg-white/10" />
          </div>
          <Skeleton className="hidden h-6 w-24 rounded-full bg-white/10" />
        </div>
        <Skeleton className="mt-5 h-16 w-full bg-white/10" />
        <div className="mt-6 grid grid-cols-3 gap-3 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
          <Skeleton className="h-12 rounded-2xl bg-white/10" />
          <Skeleton className="h-12 rounded-2xl bg-white/10" />
          <Skeleton className="h-12 rounded-2xl bg-white/10" />
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-40 bg-white/10" />
          <Skeleton className="h-4 w-20 bg-white/10" />
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell className={`p-6 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-7 w-20 rounded-full bg-white/10" />
        <Skeleton className="h-7 w-24 rounded-full bg-white/10" />
        <Skeleton className="h-7 w-24 rounded-full bg-white/10" />
      </div>

      <Skeleton className="mt-5 h-6 w-3/5 bg-white/10" />
      <Skeleton className="mt-3 h-4 w-full bg-white/10" />
      <Skeleton className="mt-2 h-4 w-11/12 bg-white/10" />

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <Skeleton className="h-3 w-16 bg-white/10" />
          <Skeleton className="mt-2 h-4 w-24 bg-white/10" />
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <Skeleton className="h-3 w-16 bg-white/10" />
          <Skeleton className="mt-2 h-4 w-24 bg-white/10" />
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <Skeleton className="h-3 w-16 bg-white/10" />
          <Skeleton className="mt-2 h-4 w-24 bg-white/10" />
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <Skeleton className="h-3 w-16 bg-white/10" />
          <Skeleton className="mt-2 h-4 w-24 bg-white/10" />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-28 bg-white/10" />
        <Skeleton className="h-4 w-16 bg-white/10" />
      </div>
    </CardShell>
  );
}
