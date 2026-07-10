import Link from "next/link";
import { ArrowRight, PencilLine } from "lucide-react";

import type { AdminSavingsProductItem } from "@/lib/service/getAdminCatalogData";
import { formatCurrency, formatDateLabel, formatEnumLabel } from "@/lib/formatters/formatters";
import { Button } from "@/components/ui/button";
import { SuperAdminCollection } from "../../_components/SuperAdminCollection";
import { toggleSavingsProductActive } from "@/actions/super-admin/savings-products/toggleSavingsProductActive";
import { SavingsProductStatusBadge } from "./SavingsProductStatusBadge";
import { SavingsProductsEmptyState } from "./SavingsProductsEmptyState";

type SavingsProductsTableProps = {
  data: AdminSavingsProductItem[];
};

function getFrequencyLabel(
  value: AdminSavingsProductItem["interestPayoutFrequency"],
) {
  return value ? formatEnumLabel(value) : "Not set";
}

function getBalanceRange(product: AdminSavingsProductItem) {
  const min = product.minBalance
    ? formatCurrency(product.minBalance, product.currency)
    : "No minimum";
  const max = product.maxBalance
    ? formatCurrency(product.maxBalance, product.currency)
    : "No maximum";
  return `${min} - ${max}`;
}

function SavingsProductActions({ product }: { product: AdminSavingsProductItem }) {
  return (
    <div className="flex flex-col gap-3 xl:w-[13rem]">
      <Link
        href={`/account/dashboard/super-admin/savings-products/${product.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.07] dark:hover:text-white"
      >
        View details
        <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href={`/account/dashboard/super-admin/savings-products/${product.id}/edit`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-transparent px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-white/8 dark:bg-transparent dark:text-slate-300 dark:hover:border-white/12 dark:hover:bg-white/[0.04] dark:hover:text-white"
      >
        <PencilLine className="h-4 w-4" />
        Edit
      </Link>
      <form action={toggleSavingsProductActive.bind(null, product.id)}>
        <Button
          type="submit"
          variant="outline"
          className="h-11 w-full rounded-2xl"
        >
          {product.isActive ? "Deactivate" : "Activate"}
        </Button>
      </form>
    </div>
  );
}

export function SavingsProductsTable({ data }: SavingsProductsTableProps) {
  if (data.length === 0) {
    return <SavingsProductsEmptyState />;
  }

  return (
    <SuperAdminCollection
      items={data}
      getItemKey={(product) => product.id}
      columns={[
          {
            key: "product",
            header: "Product",
            render: (product) => (
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  {product.name}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {product.description ?? "No description provided"}
                </p>
              </div>
            ),
        },
          {
            key: "configuration",
            header: "Configuration",
            render: (product) => (
              <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <p>
                  Interest:{" "}
                  {product.interestRatePercent !== null
                    ? `${product.interestRatePercent}%`
                    : "Not set"}
                </p>
                <p>
                  Frequency: {getFrequencyLabel(product.interestPayoutFrequency)}
                </p>
                <p>Balance: {getBalanceRange(product)}</p>
              </div>
            ),
        },
          {
            key: "status",
            header: "Status",
            render: (product) => (
              <div className="flex flex-wrap gap-2">
                <SavingsProductStatusBadge isActive={product.isActive} />
                <span className="inline-flex items-center rounded-full border border-slate-200/80 px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:text-slate-300">
                {product.allowsDeposits ? "Deposits on" : "Deposits off"}
                </span>
                <span className="inline-flex items-center rounded-full border border-slate-200/80 px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:text-slate-300">
                {product.allowsWithdrawals ? "Withdrawals on" : "Withdrawals off"}
                </span>
              </div>
            ),
        },
          {
            key: "meta",
            header: "Meta",
            render: (product) => (
              <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <p>Accounts: {product.accountCount}</p>
                <p>Sort order: {product.sortOrder}</p>
                <p>{formatDateLabel(product.createdAt)}</p>
              </div>
            ),
        },
          {
            key: "actions",
            header: "Actions",
            className: "px-5 py-4 text-right text-slate-500 dark:text-slate-400",
            cellClassName: "px-5 py-4 align-top",
            render: (product) => <SavingsProductActions product={product} />,
        },
      ]}
    />
  );
}
