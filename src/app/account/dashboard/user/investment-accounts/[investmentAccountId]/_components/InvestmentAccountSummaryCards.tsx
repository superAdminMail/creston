import { BriefcaseBusiness, Coins, Landmark, Wallet } from "lucide-react";

import type { InvestmentAccountDetailsViewModel } from "@/actions/investment-account/getInvestmentAccountDetails";
import { formatCurrency } from "@/lib/formatters";

export function InvestmentAccountSummaryCards({
  account,
}: {
  account: InvestmentAccountDetailsViewModel;
}) {
  const cards = [
    {
      label: "Plan category",
      value: account.plan.categoryLabel,
      icon: BriefcaseBusiness,
    },
    {
      label: "Investment type",
      value: account.investment.typeLabel,
      icon: Landmark,
    },
    {
      label: "Investable range",
      value: `${formatCurrency(account.plan.minAmount, account.plan.currency)} - ${formatCurrency(account.plan.maxAmount, account.plan.currency)}`,
      icon: Coins,
    },
    {
      label: "Account currency",
      value: account.currency,
      icon: Wallet,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Icon className="h-5 w-5 text-blue-300" />
              </div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                {card.label}
              </p>
            </div>

            <p className="mt-4 text-base font-semibold text-white">
              {card.value}
            </p>
          </div>
        );
      })}
    </section>
  );
}
