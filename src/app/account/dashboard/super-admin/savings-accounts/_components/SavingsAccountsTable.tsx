import Link from "next/link";
import { ArrowRight, PencilLine } from "lucide-react";

import { SuperAdminCollection } from "../../_components/SuperAdminCollection";
import type {
  SuperAdminSavingsAccountListItem,
  SuperAdminSavingsAccountsPageData,
} from "@/actions/super-admin/savings-accounts/getSuperAdminSavingsAccounts";
import { SavingsAccountStatusBadge } from "./SavingsAccountStatusBadge";
import { SavingsAccountsEmptyState } from "./SavingsAccountsEmptyState";

type SavingsAccountsTableProps = {
  data: SuperAdminSavingsAccountsPageData;
};

function SavingsAccountActions({
  account,
}: {
  account: SuperAdminSavingsAccountListItem;
}) {
  return (
    <div className="flex flex-col gap-3 xl:w-[13rem]">
      <Link
        href={`/account/dashboard/super-admin/savings-accounts/${account.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07] hover:text-white"
      >
        View details
        <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href={`/account/dashboard/super-admin/savings-accounts/${account.id}/edit`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/8 bg-transparent px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-white/12 hover:bg-white/[0.04] hover:text-white"
      >
        <PencilLine className="h-4 w-4" />
        Edit
      </Link>
    </div>
  );
}

export function SavingsAccountsTable({ data }: SavingsAccountsTableProps) {
  if (data.accounts.length === 0) {
    return <SavingsAccountsEmptyState />;
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
              <p className="text-sm font-semibold text-white">{account.name}</p>
              <p className="mt-1 text-xs text-slate-400">
                {account.ownerName} • {account.ownerEmail}
              </p>
            </div>
          ),
        },
        {
          key: "product",
          header: "Product",
          render: (account) => (
            <div>
              <p className="text-sm font-semibold text-white">
                {account.productName}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {account.productInterestEnabled
                  ? "Interest enabled"
                  : "Interest disabled"}
              </p>
            </div>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (account) => (
            <div className="space-y-2">
              <SavingsAccountStatusBadge status={account.status} />
              <p className="text-xs text-slate-400">
                {account.isLocked ? "Locked" : "Unlocked"}
              </p>
            </div>
          ),
        },
        {
          key: "balance",
          header: "Balance",
          render: (account) => (
            <span className="text-sm text-slate-200">
              {account.balance.toLocaleString("en-US", {
                style: "currency",
                currency: account.currency,
              })}
            </span>
          ),
        },
        {
          key: "target",
          header: "Target",
          render: (account) => (
            <span className="text-sm text-slate-200">
              {account.targetAmount !== null
                ? account.targetAmount.toLocaleString("en-US", {
                    style: "currency",
                    currency: account.currency,
                  })
                : "Not set"}
            </span>
          ),
        },
        {
          key: "updated",
          header: "Updated",
          render: (account) => (
            <span className="text-sm text-slate-200">{account.updatedDate}</span>
          ),
        },
        {
          key: "actions",
          header: "Actions",
          className: "px-5 py-4 text-right text-slate-400",
          cellClassName: "px-5 py-4 align-top",
          render: (account) => <SavingsAccountActions account={account} />,
        },
      ]}
    />
  );
}
