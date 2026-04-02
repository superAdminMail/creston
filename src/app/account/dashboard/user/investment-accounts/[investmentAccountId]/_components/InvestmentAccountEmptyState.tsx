import Link from "next/link";
import { ArrowLeft, CircleAlert } from "lucide-react";

type InvestmentAccountEmptyStateProps = {
  title?: string;
  description?: string;
};

export function InvestmentAccountEmptyState({
  title = "Investment account not found",
  description = "We could not find a matching investment account in your Havenstone workspace. Return to your account list and choose another account.",
}: InvestmentAccountEmptyStateProps) {
  return (
    <div className="card-premium rounded-[2rem] p-8 sm:p-10">
      <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
        <CircleAlert className="h-6 w-6 text-blue-300" />
      </div>

      <h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-white">
        {title}
      </h1>

      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
        {description}
      </p>

      <div className="mt-6">
        <Link
          href="/account/dashboard/user/investment-accounts"
          className="btn-secondary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to accounts
        </Link>
      </div>
    </div>
  );
}
