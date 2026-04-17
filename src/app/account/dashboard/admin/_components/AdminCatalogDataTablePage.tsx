import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  AdminOperationsShell,
  type AdminOperationsStat,
} from "./AdminOperationsShell";
import { AdminResponsiveCollectionShell } from "./AdminResponsiveCollectionShell";

export type AdminCatalogColumn<TItem> = {
  key: string;
  header: string;
  className?: string;
  cellClassName?: string;
  render: (item: TItem) => ReactNode;
};

type AdminCatalogDataTablePageProps<TItem> = {
  title: string;
  description: string;
  stats?: AdminOperationsStat[];
  items: TItem[];
  getItemKey: (item: TItem) => string;
  renderMobileCard: (item: TItem) => ReactNode;
  columns: AdminCatalogColumn<TItem>[];
  emptyStateLabel: string;
  emptyStateDescription?: string;
};

export function AdminCatalogDataTablePage<TItem>({
  title,
  description,
  stats,
  items,
  getItemKey,
  renderMobileCard,
  columns,
  emptyStateLabel,
  emptyStateDescription,
}: AdminCatalogDataTablePageProps<TItem>) {
  return (
    <AdminOperationsShell title={title} description={description} stats={stats}>
      <AdminResponsiveCollectionShell
        items={items}
        getItemKey={getItemKey}
        renderMobileCard={renderMobileCard}
        columns={columns}
        emptyState={
          <Card className="card-premium rounded-[1.9rem] text-center">
            <CardContent className="space-y-3 p-8">
              <h2 className="text-lg font-semibold text-white">
                No {emptyStateLabel} found
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-400">
                {emptyStateDescription ??
                  "Records for this catalog will appear here once they are available."}
              </p>
            </CardContent>
          </Card>
        }
      />
    </AdminOperationsShell>
  );
}
