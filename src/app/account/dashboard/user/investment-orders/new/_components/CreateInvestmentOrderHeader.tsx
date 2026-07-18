import Link from "next/link";
import { ArrowLeft, Landmark, Plus } from "lucide-react";

export function CreateInvestmentOrderHeader({
  siteName,
}: {
  siteName: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link
          href="/account/dashboard/user/investment-orders"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">
          Create an investment order
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
          Choose an investment type, narrow down the plan and tier, then review
          the order before it moves to payment and confirmation.
        </p>
      </div>

      <div className="inline-flex items-center gap-3 rounded-3xl border border-border/60 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 md:hidden">
        <Landmark className="h-4 w-4 text-sky-700 dark:text-sky-300" />
        5-step workflow
      </div>
    </div>
  );
}
