import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PencilLine } from "lucide-react";

import type {
  SuperAdminInvestmentListItem,
  SuperAdminInvestmentsData,
} from "@/actions/super-admin/investments/getSuperAdminInvestments";
import { toggleInvestmentActive } from "@/actions/super-admin/investments/toggleInvestmentActive";
import { Button } from "@/components/ui/button";
import { SuperAdminCollection } from "../../_components/SuperAdminCollection";
import { SuperAdminTableFilters } from "../../_components/SuperAdminTableFilters";
import { InvestmentsEmptyState } from "./InvestmentsEmptyState";
import { InvestmentStatusBadge } from "./InvestmentStatusBadge";

type InvestmentsTableProps = {
  data: SuperAdminInvestmentsData;
};

function InvestmentActions({
  investment,
}: {
  investment: SuperAdminInvestmentListItem;
}) {
  return (
    <div className="flex flex-col gap-3 xl:w-[13rem]">
      <Link
        href={`/account/dashboard/super-admin/investments/${investment.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07] hover:text-white"
      >
        View details
        <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href={`/account/dashboard/super-admin/investments/${investment.id}/edit`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/8 bg-transparent px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-white/12 hover:bg-white/[0.04] hover:text-white"
      >
        <PencilLine className="h-4 w-4" />
        Edit
      </Link>
      <form action={toggleInvestmentActive.bind(null, investment.id)}>
        <Button
          type="submit"
          variant="destructive"
          className="h-11 w-full rounded-2xl"
        >
          {investment.isActive ? "Deactivate" : "Activate"}
        </Button>
      </form>
    </div>
  );
}

function InvestmentMobileCard({
  investment,
}: {
  investment: SuperAdminInvestmentListItem;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {investment.iconUrl ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <Image
              src={investment.iconUrl}
              alt={`${investment.name} icon`}
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
          </div>
        ) : null}
        <h2 className="text-lg font-semibold text-white">{investment.name}</h2>
        <InvestmentStatusBadge
          status={investment.status}
          label={investment.statusLabel}
        />
        <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300">
          {investment.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Type
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {investment.typeLabel}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Period
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {investment.periodLabel}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Sort order
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {investment.sortOrder}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Plans
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {investment.plansCount}
          </p>
        </div>
      </div>

      <InvestmentActions investment={investment} />
    </div>
  );
}

export function InvestmentsTable({ data }: InvestmentsTableProps) {
  if (data.investments.length === 0) {
    return <InvestmentsEmptyState />;
  }

  return (
    <div className="space-y-6">
      <SuperAdminTableFilters
        columnsClassName="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        fields={[
          {
            kind: "select",
            name: "type",
            placeholder: "All types",
            value: data.filters.type,
            options: data.filterOptions.types,
          },
          {
            kind: "select",
            name: "period",
            placeholder: "All periods",
            value: data.filters.period,
            options: data.filterOptions.periods,
          },
          {
            kind: "select",
            name: "status",
            placeholder: "All statuses",
            value: data.filters.status,
            options: data.filterOptions.statuses,
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
        items={data.investments}
        getItemKey={(investment) => investment.id}
        renderMobileCard={(investment) => (
          <InvestmentMobileCard investment={investment} />
        )}
        columns={[
          {
            key: "investment",
            header: "Investment",
            render: (investment) => (
              <div className="flex items-center gap-3">
                {investment.iconUrl ? (
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <Image
                      src={investment.iconUrl}
                      alt={`${investment.name} icon`}
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                    />
                  </div>
                ) : null}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {investment.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {investment.slug}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: "type",
            header: "Type",
            render: (investment) => (
              <span className="text-sm text-slate-200">
                {investment.typeLabel}
              </span>
            ),
          },
          {
            key: "period",
            header: "Period",
            render: (investment) => (
              <span className="text-sm text-slate-200">
                {investment.periodLabel}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (investment) => (
              <div className="flex flex-wrap gap-2">
                <InvestmentStatusBadge
                  status={investment.status}
                  label={investment.statusLabel}
                />
                <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300">
                  {investment.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ),
          },
          {
            key: "sortOrder",
            header: "Sort order",
            render: (investment) => (
              <span className="text-sm text-slate-200">
                {investment.sortOrder}
              </span>
            ),
          },
          {
            key: "plans",
            header: "Plans",
            render: (investment) => (
              <span className="text-sm text-slate-200">
                {investment.plansCount}
              </span>
            ),
          },
          {
            key: "updatedAt",
            header: "Updated",
            render: (investment) => (
              <span className="text-sm text-slate-200">
                {investment.updatedAt}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            className: "px-5 py-4 text-right text-slate-400",
            cellClassName: "px-5 py-4 align-top",
            render: (investment) => (
              <InvestmentActions investment={investment} />
            ),
          },
        ]}
      />
    </div>
  );
}
