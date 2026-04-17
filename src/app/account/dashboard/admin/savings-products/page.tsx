import {
  AdminCatalogDataTablePage,
  type AdminCatalogColumn,
} from "../_components/AdminCatalogDataTablePage";
import { getAdminSavingsProducts } from "@/lib/service/getAdminCatalogData";
import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import { Badge } from "@/components/ui/badge";
import type { AdminSavingsProductItem } from "@/lib/service/getAdminCatalogData";
import { cn } from "@/lib/utils";

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

export default async function AdminSavingsProductsPage() {
  const products = await getAdminSavingsProducts();

  const columns: AdminCatalogColumn<AdminSavingsProductItem>[] = [
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
          <Badge
            variant="secondary"
            className={cn(
              "border",
              product.isActive
                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                : "border-slate-400/20 bg-slate-500/10 text-slate-300",
            )}
          >
            {product.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="secondary" className="border-white/10 bg-white/10">
            {product.allowsDeposits ? "Deposits on" : "Deposits off"}
          </Badge>
          <Badge variant="secondary" className="border-white/10 bg-white/10">
            {product.allowsWithdrawals ? "Withdrawals on" : "Withdrawals off"}
          </Badge>
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
  ];

  return (
    <AdminCatalogDataTablePage
      title="Savings Products"
      description="Review the savings product catalog, its balance rules, and the number of linked accounts."
      stats={[
        {
          title: "Total products",
          value: String(products.length),
          hint: "All configured savings products",
        },
        {
          title: "Active products",
          value: String(products.filter((product) => product.isActive).length),
          hint: "Products currently available to investors",
        },
      ]}
      items={products}
      getItemKey={(item) => item.id}
      columns={columns}
      renderMobileCard={(product) => (
        <div className="space-y-3">
          <div>
            <p className="text-base font-semibold text-white">{product.name}</p>
            <p className="mt-1 text-sm text-slate-400">
              {product.description ?? "No description provided"}
            </p>
          </div>
          <div className="space-y-1 text-xs leading-6 text-slate-400">
            <p>
              Interest:{" "}
              {product.interestRatePercent !== null
                ? `${product.interestRatePercent}%`
                : "Not set"}
            </p>
            <p>Frequency: {getFrequencyLabel(product.interestPayoutFrequency)}</p>
            <p>Balance: {getBalanceRange(product)}</p>
            <p>Accounts: {product.accountCount}</p>
            <p>{formatDateLabel(product.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="border-white/10 bg-white/10">
              {product.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="secondary" className="border-white/10 bg-white/10">
              {product.allowsDeposits ? "Deposits on" : "Deposits off"}
            </Badge>
            <Badge variant="secondary" className="border-white/10 bg-white/10">
              {product.allowsWithdrawals ? "Withdrawals on" : "Withdrawals off"}
            </Badge>
          </div>
        </div>
      )}
      emptyStateLabel="savings products"
    />
  );
}
