import Image from "next/image";
import { Layers3 } from "lucide-react";

import type { InvestmentAccountDetailsViewModel } from "@/actions/investment-account/getInvestmentAccountDetails";
import { cn } from "@/lib/utils";

function getRiskClasses(riskLevel: InvestmentAccountDetailsViewModel["investment"]["riskLevel"]) {
  switch (riskLevel) {
    case "LOW":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    case "HIGH":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";
    default:
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";
  }
}

export function InvestmentProductCard({
  account,
}: {
  account: InvestmentAccountDetailsViewModel;
}) {
  return (
    <section className="card-premium rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
            {account.investment.icon?.url ? (
              <Image
                src={account.investment.icon.url}
                alt={account.investment.icon.alt}
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
            ) : (
              <Layers3 className="h-6 w-6 text-blue-300" />
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
              Investment product
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {account.investment.description}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex rounded-full border px-3 py-1 text-xs font-medium",
            getRiskClasses(account.investment.riskLevel),
          )}
        >
          {account.investment.riskLevelLabel} risk
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Investment name
          </p>
          <p className="mt-3 text-base font-semibold text-white">
            {account.investment.name}
          </p>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Type
          </p>
          <p className="mt-3 text-base font-semibold text-white">
            {account.investment.typeLabel}
          </p>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Catalog status
          </p>
          <p className="mt-3 text-base font-semibold text-white">
            {account.investment.statusLabel}
          </p>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Period
          </p>
          <p className="mt-3 text-base font-semibold text-white">
            {account.investment.periodLabel}
          </p>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Active state
          </p>
          <p className="mt-3 text-base font-semibold text-white">
            {account.investment.isActive ? "Active" : "Inactive"}
          </p>
        </div>
      </div>
    </section>
  );
}
