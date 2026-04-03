import Link from "next/link";
import { ArrowRight, PencilLine } from "lucide-react";

import type {
  SuperAdminInvestmentPlanListItem,
  SuperAdminInvestmentPlansData,
} from "@/actions/super-admin/investment-plans/getSuperAdminInvestmentPlans";
import { toggleInvestmentPlanActive } from "@/actions/super-admin/investment-plans/toggleInvestmentPlanActive";
import { Button } from "@/components/ui/button";
import { SuperAdminCollection } from "../../_components/SuperAdminCollection";
import { SuperAdminTableFilters } from "../../_components/SuperAdminTableFilters";
import { InvestmentPlansEmptyState } from "./InvestmentPlansEmptyState";
import { InvestmentPlanStatusBadge } from "./InvestmentPlanStatusBadge";

type InvestmentPlansTableProps = {
  data: SuperAdminInvestmentPlansData;
};

function InvestmentPlanActions({
  plan,
}: {
  plan: SuperAdminInvestmentPlanListItem;
}) {
  return (
    <div className="flex flex-col gap-3 xl:w-[13rem]">
      <Link
        href={`/account/dashboard/super-admin/investment-plans/${plan.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07] hover:text-white"
      >
        View details
        <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href={`/account/dashboard/super-admin/investment-plans/${plan.id}/edit`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/8 bg-transparent px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-white/12 hover:bg-white/[0.04] hover:text-white"
      >
        <PencilLine className="h-4 w-4" />
        Edit
      </Link>
      <form action={toggleInvestmentPlanActive.bind(null, plan.id)}>
        <Button
          type="submit"
          variant="outline"
          className="h-11 w-full rounded-2xl"
        >
          {plan.isActive ? "Deactivate" : "Activate"}
        </Button>
      </form>
    </div>
  );
}

function InvestmentPlanMobileCard({
  plan,
}: {
  plan: SuperAdminInvestmentPlanListItem;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
        <InvestmentPlanStatusBadge isActive={plan.isActive} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Investment
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {plan.investmentName}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Category
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {plan.categoryLabel}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Period
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {plan.periodLabel}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Range
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {plan.minAmountLabel} - {plan.maxAmountLabel}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Updated
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {plan.updatedAt}
          </p>
        </div>
      </div>

      <InvestmentPlanActions plan={plan} />
    </div>
  );
}

export function InvestmentPlansTable({ data }: InvestmentPlansTableProps) {
  if (data.plans.length === 0) {
    return <InvestmentPlansEmptyState />;
  }

  return (
    <div className="space-y-6">
      <SuperAdminTableFilters
        columnsClassName="grid gap-3 md:grid-cols-2 xl:grid-cols-5"
        fields={[
          {
            kind: "select",
            name: "investmentId",
            placeholder: "All investments",
            value: data.filters.investmentId,
            options: data.filterOptions.investments.map((option) => ({
              value: option.id,
              label: option.name,
            })),
          },
          {
            kind: "select",
            name: "category",
            placeholder: "All categories",
            value: data.filters.category,
            options: data.filterOptions.categories,
          },
          {
            kind: "select",
            name: "period",
            placeholder: "All periods",
            value: data.filters.period,
            options: data.filterOptions.periods,
          },
          {
            kind: "text",
            name: "currency",
            placeholder: "Currency",
            value: data.filters.currency,
          },
          {
            kind: "select",
            name: "isActive",
            placeholder: "All activity states",
            value: data.filters.isActive,
            options: [
              { value: "true", label: "Active only" },
              { value: "false", label: "Inactive only" },
            ],
          },
        ]}
      />

      <SuperAdminCollection
        items={data.plans}
        getItemKey={(plan) => plan.id}
        renderMobileCard={(plan) => <InvestmentPlanMobileCard plan={plan} />}
        columns={[
          {
            key: "plan",
            header: "Plan",
            render: (plan) => (
              <div>
                <p className="text-sm font-semibold text-white">{plan.name}</p>
                <p className="mt-1 text-xs text-slate-400">{plan.slug}</p>
              </div>
            ),
          },
          {
            key: "investment",
            header: "Investment",
            render: (plan) => (
              <span className="text-sm text-slate-200">
                {plan.investmentName}
              </span>
            ),
          },
          {
            key: "category",
            header: "Category",
            render: (plan) => (
              <span className="text-sm text-slate-200">
                {plan.categoryLabel}
              </span>
            ),
          },
          {
            key: "period",
            header: "Period",
            render: (plan) => (
              <span className="text-sm text-slate-200">
                {plan.periodLabel}
              </span>
            ),
          },
          {
            key: "range",
            header: "Range",
            render: (plan) => (
              <span className="text-sm text-slate-200">
                {plan.minAmountLabel} - {plan.maxAmountLabel}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (plan) => <InvestmentPlanStatusBadge isActive={plan.isActive} />,
          },
          {
            key: "updatedAt",
            header: "Updated",
            render: (plan) => (
              <span className="text-sm text-slate-200">{plan.updatedAt}</span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            className: "px-5 py-4 text-right text-slate-400",
            cellClassName: "px-5 py-4 align-top",
            render: (plan) => <InvestmentPlanActions plan={plan} />,
          },
        ]}
      />
    </div>
  );
}
