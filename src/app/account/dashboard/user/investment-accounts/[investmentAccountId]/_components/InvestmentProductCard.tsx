import Image from "next/image";
import { CheckCircle2, Layers3, PackageCheck, ShieldCheck } from "lucide-react";

import type { InvestmentAccountDetailsViewModel } from "@/actions/investment-account/getInvestmentAccountDetails";
import { cn } from "@/lib/utils";
import { DashboardSectionCard } from "../../../../_components/DashboardSectionCard";

function StatusItem({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            active
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
              : "bg-slate-200/70 text-slate-600 dark:bg-white/5 dark:text-slate-400",
          )}
        >
          <CheckCircle2 className="h-4 w-4" />
        </span>

        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
      </div>

      <span
        className={cn(
          "text-sm font-semibold",
          active
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-slate-600 dark:text-slate-400",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function InvestmentProductCard({
  account,
}: {
  account: InvestmentAccountDetailsViewModel;
}) {
  return (
    <DashboardSectionCard>
      <div className="space-y-6">
        {/* Product identity */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-400">
            <PackageCheck className="h-4 w-4" />
            Product information
          </div>

          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.04]">
              {account.investment.icon?.url ? (
                <Image
                  src={account.investment.icon.url}
                  alt={account.investment.icon.alt}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <Layers3 className="h-6 w-6 text-sky-800 dark:text-sky-400" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {account.investment.name}
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                {account.investment.typeLabel}
              </p>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                {account.investment.description}
              </p>
            </div>
          </div>
        </div>

        {/* Product metadata */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Layers3 className="h-4 w-4" />
              <p className="text-xs font-medium">Investment type</p>
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
              {account.investment.typeLabel}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-xs font-medium">Catalog status</p>
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
              {account.investment.statusLabel}
            </p>
          </div>
        </div>

        {/* Product availability */}
        <div className="space-y-3 border-t border-slate-100 pt-5 dark:border-white/10">
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
            Product availability
          </h3>

          <StatusItem
            label="Product state"
            value={account.investment.isActive ? "Active" : "Inactive"}
            active={account.investment.isActive}
          />
        </div>
      </div>
    </DashboardSectionCard>
  );
}
