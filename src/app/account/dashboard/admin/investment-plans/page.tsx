import {
  AdminCatalogDataTablePage,
  type AdminCatalogColumn,
} from "../_components/AdminCatalogDataTablePage";
import { getAdminInvestmentPlans } from "@/lib/service/getAdminCatalogData";
import {
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import { Badge } from "@/components/ui/badge";
import type { AdminInvestmentPlanItem } from "@/lib/service/getAdminCatalogData";
import { cn } from "@/lib/utils";

function getReturnRange(plan: AdminInvestmentPlanItem) {
  const min = plan.expectedReturnMin
    ? `${plan.expectedReturnMin}%`
    : "No minimum";
  const max = plan.expectedReturnMax
    ? `${plan.expectedReturnMax}%`
    : "No maximum";
  return `${min} - ${max}`;
}

export default async function AdminInvestmentPlansPage() {
  const plans = await getAdminInvestmentPlans();

  const columns: AdminCatalogColumn<AdminInvestmentPlanItem>[] = [
    {
      key: "plan",
      header: "Plan",
      render: (plan) => (
        <div>
          <p className="text-sm font-semibold text-white">{plan.name}</p>
          <p className="mt-1 text-xs text-slate-400">
            {plan.description ?? "No description provided"}
          </p>
        </div>
      ),
    },
    {
      key: "catalog",
      header: "Catalog",
      render: (plan) => (
        <div className="space-y-1 text-sm text-slate-300">
          <p>{plan.investmentName}</p>
          <p>
            {formatEnumLabel(plan.investmentType)} •{" "}
            {formatEnumLabel(plan.investmentModel)}
          </p>
          <p>{formatEnumLabel(plan.period)}</p>
        </div>
      ),
    },
    {
      key: "returns",
      header: "Returns",
      render: (plan) => (
        <div className="space-y-1 text-sm text-slate-300">
          <p>{getReturnRange(plan)}</p>
          <p>Duration: {plan.durationDays} days</p>
          <p>Currency: {plan.currency}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (plan) => (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "border",
              plan.isActive
                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                : "border-slate-400/20 bg-slate-500/10 text-slate-300",
            )}
          >
            {plan.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              "border",
              plan.isLocked
                ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
                : "border-white/10 bg-white/10",
            )}
          >
            {plan.isLocked ? "Locked" : "Open"}
          </Badge>
          <Badge variant="secondary" className="border-white/10 bg-white/10">
            {plan.allowWithdrawal ? "Withdrawable" : "Locked in"}
          </Badge>
        </div>
      ),
    },
    {
      key: "meta",
      header: "Meta",
      render: (plan) => (
        <div className="space-y-1 text-sm text-slate-400">
          <p>Accounts: {plan.accountCount}</p>
          <p>Orders: {plan.orderCount}</p>
          <p>{formatDateLabel(plan.createdAt)}</p>
        </div>
      ),
    },
  ];

  return (
    <AdminCatalogDataTablePage
      title="Investment Plans"
      description="Review the investment plan catalog, expected return bands, lock state, and linked accounts."
      stats={[
        {
          title: "Total plans",
          value: String(plans.length),
          hint: "Configured plan records",
        },
        {
          title: "Active plans",
          value: String(plans.filter((plan) => plan.isActive).length),
          hint: "Plans currently available to investors",
        },
      ]}
      items={plans}
      getItemKey={(item) => item.id}
      columns={columns}
      renderMobileCard={(plan) => (
        <div className="space-y-3">
          <div>
            <p className="text-base font-semibold text-white">{plan.name}</p>
            <p className="mt-1 text-sm text-slate-400">
              {plan.description ?? "No description provided"}
            </p>
          </div>
          <div className="space-y-1 text-xs leading-6 text-slate-400">
            <p>{plan.investmentName}</p>
            <p>
              {formatEnumLabel(plan.investmentType)} •{" "}
              {formatEnumLabel(plan.investmentModel)}
            </p>
            <p>{formatEnumLabel(plan.period)}</p>
            <p>Returns: {getReturnRange(plan)}</p>
            <p>Accounts: {plan.accountCount}</p>
            <p>Orders: {plan.orderCount}</p>
            <p>{formatDateLabel(plan.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="border-white/10 bg-white/10">
              {plan.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                "border",
                plan.isLocked
                  ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
                  : "border-white/10 bg-white/10",
              )}
            >
              {plan.isLocked ? "Locked" : "Open"}
            </Badge>
            <Badge variant="secondary" className="border-white/10 bg-white/10">
              {plan.allowWithdrawal ? "Withdrawable" : "Locked in"}
            </Badge>
          </div>
        </div>
      )}
      emptyStateLabel="investment plans"
    />
  );
}
