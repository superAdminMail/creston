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
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07] hover:text-white"
      >
        View details
        <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href={`/account/dashboard/super-admin/savings-products/${product.id}/edit`}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/8 bg-transparent px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-white/12 hover:bg-white/[0.04] hover:text-white"
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

function SavingsProductMobileCard({ product }: { product: AdminSavingsProductItem }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-white">{product.name}</h2>
        <SavingsProductStatusBadge isActive={product.isActive} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Interest
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {product.interestRatePercent !== null
              ? `${product.interestRatePercent}%`
              : "Not set"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Frequency
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {getFrequencyLabel(product.interestPayoutFrequency)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Balance
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {getBalanceRange(product)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Accounts
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {product.accountCount}
          </p>
        </div>
      </div>

      <SavingsProductActions product={product} />
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
      renderMobileCard={(product) => (
        <SavingsProductMobileCard product={product} />
      )}
      columns={[
        {
          key: "product",
          header: "Product",
          render: (product) => (
            <div>
              <p className="text-sm font-semibold text-white">{product.name}</p>
              <p className="mt-1 text-xs text-slate-400">
                {product.description ?? "No description provided"}
              </p>
            </div>
          ),
        },
        {
          key: "configuration",
          header: "Configuration",
          render: (product) => (
            <div className="space-y-1 text-sm text-slate-300">
              <p>
                Interest:{" "}
                {product.interestRatePercent !== null
                  ? `${product.interestRatePercent}%`
                  : "Not set"}
              </p>
              <p>Frequency: {getFrequencyLabel(product.interestPayoutFrequency)}</p>
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
              <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300">
                {product.allowsDeposits ? "Deposits on" : "Deposits off"}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300">
                {product.allowsWithdrawals ? "Withdrawals on" : "Withdrawals off"}
              </span>
            </div>
          ),
        },
        {
          key: "meta",
          header: "Meta",
          render: (product) => (
            <div className="space-y-1 text-sm text-slate-400">
              <p>Accounts: {product.accountCount}</p>
              <p>Sort order: {product.sortOrder}</p>
              <p>{formatDateLabel(product.createdAt)}</p>
            </div>
          ),
        },
        {
          key: "actions",
          header: "Actions",
          className: "px-5 py-4 text-right text-slate-400",
          cellClassName: "px-5 py-4 align-top",
          render: (product) => <SavingsProductActions product={product} />,
        },
      ]}
    />
  );
}
