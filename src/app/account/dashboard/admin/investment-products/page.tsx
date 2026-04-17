import {
  AdminCatalogDataTablePage,
  type AdminCatalogColumn,
} from "../_components/AdminCatalogDataTablePage";
import { getAdminInvestmentProducts } from "@/lib/service/getAdminCatalogData";
import { formatDateLabel, formatEnumLabel } from "@/lib/formatters/formatters";
import { Badge } from "@/components/ui/badge";
import type { AdminInvestmentProductItem } from "@/lib/service/getAdminCatalogData";
import { cn } from "@/lib/utils";

export default async function AdminInvestmentProductsPage() {
  const products = await getAdminInvestmentProducts();

  const columns: AdminCatalogColumn<AdminInvestmentProductItem>[] = [
    {
      key: "product",
      header: "Product",
      render: (product) => (
        <div>
          <p className="text-sm font-semibold text-white">{product.name}</p>
          <p className="mt-1 text-xs text-slate-400">
            {product.symbol ? `${product.symbol} • ` : ""}
            {product.slug}
          </p>
        </div>
      ),
    },
    {
      key: "classification",
      header: "Classification",
      render: (product) => (
        <div className="space-y-1 text-sm text-slate-300">
          <p>{formatEnumLabel(product.type)}</p>
          <p>{formatEnumLabel(product.status)}</p>
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
            Plans: {product.planCount}
          </Badge>
        </div>
      ),
    },
    {
      key: "meta",
      header: "Meta",
      render: (product) => (
        <div className="space-y-1 text-sm text-slate-400">
          <p>Sort order: {product.sortOrder}</p>
          <p>{formatDateLabel(product.createdAt)}</p>
        </div>
      ),
    },
  ];

  return (
    <AdminCatalogDataTablePage
      title="Investment Products"
      description="Review the underlying investment catalog, product status, and how many plans are attached to each product."
      stats={[
        {
          title: "Total products",
          value: String(products.length),
          hint: "Configured investment products",
        },
        {
          title: "Active products",
          value: String(products.filter((product) => product.isActive).length),
          hint: "Products currently visible to investors",
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
              {product.symbol ? `${product.symbol} • ` : ""}
              {product.slug}
            </p>
          </div>
          <div className="space-y-1 text-xs leading-6 text-slate-400">
            <p>{formatEnumLabel(product.type)}</p>
            <p>{formatEnumLabel(product.status)}</p>
            <p>Plans: {product.planCount}</p>
            <p>Sort order: {product.sortOrder}</p>
            <p>{formatDateLabel(product.createdAt)}</p>
          </div>
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
              Plans: {product.planCount}
            </Badge>
          </div>
        </div>
      )}
      emptyStateLabel="investment products"
    />
  );
}
