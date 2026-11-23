import Link from "next/link";
import { ArrowUpRight, Plus, TrendingUp } from "lucide-react";

type UserInvestmentsHeaderProps = {
  siteName: string;
  showNewOrderButton: boolean;
};

export function UserInvestmentsHeader({
  siteName,
  showNewOrderButton,
}: UserInvestmentsHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/75 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/[0.035]">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/[0.07] blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-800 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200">
            <TrendingUp className="h-3.5 w-3.5" />
            Investment portfolio
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
              My orders
            </h1>

            <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-400">
              Manage your {siteName} investment orders, monitor payment progress
              and keep track of your investment activity.
            </p>
          </div>
        </div>

        {showNewOrderButton && (
          <Link
            href="/account/dashboard/user/investment-orders/new"
            className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create investment
            <ArrowUpRight className="h-4 w-4 opacity-70" />
          </Link>
        )}
      </div>
    </header>
  );
}
