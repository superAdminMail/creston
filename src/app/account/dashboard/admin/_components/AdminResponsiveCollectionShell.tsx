import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "../../_components/dashboardSurfaces";

type Column<TItem> = {
  key: string;
  header: string;
  className?: string;
  cellClassName?: string;
  render: (item: TItem) => ReactNode;
};

type AdminResponsiveCollectionShellProps<TItem> = {
  items: TItem[];
  getItemKey: (item: TItem) => string;
  columns: Column<TItem>[];
  emptyState?: ReactNode;
};

export function AdminResponsiveCollectionShell<TItem>({
  items,
  getItemKey,
  columns,
  emptyState,
}: AdminResponsiveCollectionShellProps<TItem>) {
  if (items.length === 0) {
    return emptyState ? (
      <>{emptyState}</>
    ) : (
      <Card className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "text-center")}>
        <CardContent className="space-y-3 p-8">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
            No records found
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
            New records will appear here once data becomes available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn(DASHBOARD_PAGE_SURFACE_CLASS, "py-0")}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-max">
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent dark:border-white/10">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={column.className ?? "px-5 py-4 text-slate-500 dark:text-slate-400"}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={getItemKey(item)}
                  className="border-border/60 hover:bg-white/[0.04] dark:border-white/10 dark:hover:bg-white/[0.03]"
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={column.cellClassName ?? "px-5 py-4 align-top text-slate-700 dark:text-slate-300"}
                    >
                      {column.render(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
