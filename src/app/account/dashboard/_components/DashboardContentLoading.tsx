import { Skeleton } from "@/components/ui/skeleton";

type DashboardContentLoadingVariant =
  | "investment-orders"
  | "investment-order-create"
  | "investment-account-details";

type DashboardContentLoadingProps = {
  variant: DashboardContentLoadingVariant;
};

const shellClassName =
  "rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))]";

function InvestmentOrdersLoading() {
  return (
    <div className="space-y-6">
      <section className={shellClassName}>
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl rounded-full" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-2xl" />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
        <div className={shellClassName}>
          <Skeleton className="h-5 w-36 rounded-full" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className={shellClassName}>
            <Skeleton className="h-5 w-28 rounded-full" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-12 rounded-2xl" />
              <Skeleton className="h-12 rounded-2xl" />
              <Skeleton className="h-12 rounded-2xl" />
            </div>
          </div>

          <div className={shellClassName}>
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="mt-3 h-4 w-full rounded-full" />
            <Skeleton className="mt-2 h-4 w-3/4 rounded-full" />
          </div>
        </div>
      </section>
    </div>
  );
}

function InvestmentOrderCreateLoading() {
  return (
    <div className="space-y-6">
      <section className={shellClassName}>
        <Skeleton className="h-5 w-44 rounded-full" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl rounded-full" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-2xl" />
          ))}
        </div>
      </section>

      <section className={shellClassName}>
        <Skeleton className="h-5 w-36 rounded-full" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 rounded-2xl" />
          ))}
        </div>
      </section>
    </div>
  );
}

function InvestmentAccountDetailsLoading() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
        <div className={shellClassName}>
          <Skeleton className="h-6 w-52 rounded-full" />
          <Skeleton className="mt-3 h-4 w-full max-w-2xl rounded-full" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className={shellClassName}>
            <Skeleton className="h-5 w-32 rounded-full" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-12 rounded-2xl" />
              <Skeleton className="h-12 rounded-2xl" />
              <Skeleton className="h-12 rounded-2xl" />
            </div>
          </section>

          <section className={shellClassName}>
            <Skeleton className="h-5 w-36 rounded-full" />
            <Skeleton className="mt-3 h-4 w-full rounded-full" />
            <Skeleton className="mt-2 h-4 w-3/4 rounded-full" />
          </section>
        </div>
      </section>
    </div>
  );
}

export function DashboardContentLoading({
  variant,
}: DashboardContentLoadingProps) {
  switch (variant) {
    case "investment-orders":
      return <InvestmentOrdersLoading />;
    case "investment-order-create":
      return <InvestmentOrderCreateLoading />;
    case "investment-account-details":
      return <InvestmentAccountDetailsLoading />;
    default:
      return null;
  }
}
