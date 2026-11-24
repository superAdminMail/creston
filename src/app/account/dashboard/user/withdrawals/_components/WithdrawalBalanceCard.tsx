"use client";

import { Wallet, PiggyBank, TrendingUp } from "lucide-react";

import { formatCurrency } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";
import { DASHBOARD_PAGE_PANEL_CLASS } from "../../../_components/dashboardSurfaces";

type Props = {
  totalAvailableBalance: number;
  savingsBalance: number;
  investmentBalance: number;
  currency: string;
  description: string;
};

export default function WithdrawalBalanceCard({
  totalAvailableBalance,
  savingsBalance,
  investmentBalance,
  currency,
  description,
}: Props) {
  const sources = [
    {
      label: "Savings balance",
      amount: savingsBalance,
      icon: PiggyBank,
    },
    {
      label: "Investment balance",
      amount: investmentBalance,
      icon: TrendingUp,
    },
  ];

  return (
    <section
      aria-labelledby="withdrawal-balance-heading"
      className={cn(DASHBOARD_PAGE_PANEL_CLASS, "overflow-hidden p-5 sm:p-6")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Overview
          </p>
          <h2
            id="withdrawal-balance-heading"
            className="text-base font-semibold text-slate-950 dark:text-white"
          >
            Available withdrawal balance
          </h2>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-300">
          <Wallet className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Total available
        </p>

        <p className="mt-2 break-words text-3xl font-bold tracking-[-0.045em] text-slate-950 sm:text-4xl dark:text-white">
          {formatCurrency(totalAvailableBalance, currency)}
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>

      <div className="mt-6 grid gap-3 border-t border-border/60 pt-5 sm:grid-cols-2 dark:border-white/10">
        {sources.map(({ label, amount, icon: Icon }) => (
          <div
            key={label}
            className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sky-800 shadow-sm dark:bg-white/[0.06] dark:text-sky-300">
              <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {label}
              </p>
              <p className="mt-1 break-words text-base font-semibold text-slate-950 dark:text-white">
                {formatCurrency(amount, currency)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
