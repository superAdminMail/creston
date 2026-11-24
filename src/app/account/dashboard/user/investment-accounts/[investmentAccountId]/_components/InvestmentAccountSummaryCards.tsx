import { BriefcaseBusiness, Coins, Landmark, Wallet } from "lucide-react";

import type { InvestmentAccountDetailsViewModel } from "@/actions/investment-account/getInvestmentAccountDetails";

export function InvestmentAccountSummaryCards({
  account,
}: {
  account: InvestmentAccountDetailsViewModel;
}) {
  const cards = [
    {
      label: "Plan period",
      value: account.plan.periodLabel,
      icon: BriefcaseBusiness,
    },
    {
      label: "Investment type",
      value: account.investment.typeLabel,
      icon: Landmark,
    },
    {
      label: "Tier options",
      value: account.plan.tiersCountLabel,
      icon: Coins,
    },
    {
      label: "Account currency",
      value: account.currency,
      icon: Wallet,
    },
  ];

  return (
    <section
      aria-label="Investment account summary"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md dark:border-white/10 dark:bg-slate-900 dark:hover:border-sky-400/30"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-800 transition-colors group-hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:group-hover:bg-sky-500/15">
                <Icon className="h-5 w-5" />
              </div>

              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Account detail
              </span>
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {card.label}
              </p>

              <p className="mt-2 break-words text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
