import Link from "next/link";
import { ArrowRight, PencilLine } from "lucide-react";

import { SuperAdminCollection } from "../../_components/SuperAdminCollection";
import {
  type SuperAdminInvestmentAccountListItem,
  type SuperAdminInvestmentAccountsPageData,
} from "@/actions/super-admin/investment-accounts/getSuperAdminInvestmentAccounts";
import { InvestmentAccountStatusBadge } from "./InvestmentAccountStatusBadge";
import { InvestmentAccountsEmptyState } from "./InvestmentAccountsEmptyState";

type InvestmentAccountsTableProps = {
  data: SuperAdminInvestmentAccountsPageData;
};

function InvestmentAccountActions({
  account,
}: {
  account: SuperAdminInvestmentAccountListItem;
}) {
  return (
    <div className="flex flex-col gap-3 xl:w-[13rem]">
      <Link
        href={`/account/dashboard/super-admin/investment-accounts/${account.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.07] dark:hover:text-white"
      >
        View details
        <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href={`/account/dashboard/super-admin/investment-accounts/${account.id}/edit`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-transparent px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-white/8 dark:bg-transparent dark:text-slate-300 dark:hover:border-white/12 dark:hover:bg-white/[0.04] dark:hover:text-white"
      >
        <PencilLine className="h-4 w-4" />
        Manage
      </Link>
      <Link
        href={`/account/dashboard/super-admin/investment-orders?investmentAccountId=${account.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-transparent px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-white/8 dark:bg-transparent dark:text-slate-300 dark:hover:border-white/12 dark:hover:bg-white/[0.04] dark:hover:text-white"
      >
        Orders
      </Link>
    </div>
  );
}

export function InvestmentAccountsTable({ data }: InvestmentAccountsTableProps) {
  if (data.accounts.length === 0) {
    return <InvestmentAccountsEmptyState />;
  }

  return (
    <SuperAdminCollection
      items={data.accounts}
      getItemKey={(account) => account.id}
      columns={[
        {
          key: "account",
          header: "Account",
            render: (account) => (
              <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                {account.ownerName}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {account.ownerEmail}
              </p>
              </div>
            ),
        },
        {
          key: "plan",
          header: "Plan",
            render: (account) => (
              <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                {account.planName}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {account.investmentName}
              </p>
              </div>
          ),
        },
        {
          key: "status",
          header: "Status",
            render: (account) => (
              <div className="space-y-2">
                <InvestmentAccountStatusBadge status={account.status} />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {account.planPeriodLabel}
              </p>
              </div>
            ),
        },
        {
          key: "balance",
          header: "Balance",
            render: (account) => (
            <span className="text-sm text-slate-700 dark:text-slate-200">
              {account.balance.toLocaleString("en-US", {
                style: "currency",
                currency: account.currency,
              })}
            </span>
          ),
        },
        {
            key: "orders",
            header: "Orders",
            render: (account) => (
            <span className="text-sm text-slate-700 dark:text-slate-200">
              {account.orderCount}
            </span>
            ),
        },
        {
            key: "updated",
            header: "Updated",
            render: (account) => (
            <span className="text-sm text-slate-700 dark:text-slate-200">
              {account.updatedDate}
            </span>
            ),
        },
          {
            key: "actions",
            header: "Actions",
            className: "px-5 py-4 text-right text-slate-500 dark:text-slate-400",
            cellClassName: "px-5 py-4 align-top",
            render: (account) => <InvestmentAccountActions account={account} />,
        },
      ]}
    />
  );
}
