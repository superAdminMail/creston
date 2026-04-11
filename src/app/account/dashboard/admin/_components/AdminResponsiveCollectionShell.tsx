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
  renderMobileCard: (item: TItem) => ReactNode;
  columns: Column<TItem>[];
  emptyState?: ReactNode;
};

export function AdminResponsiveCollectionShell<TItem>({
  items,
  getItemKey,
  renderMobileCard,
  columns,
  emptyState,
}: AdminResponsiveCollectionShellProps<TItem>) {
  if (items.length === 0) {
    return emptyState ? (
      <>{emptyState}</>
    ) : (
      <Card className="rounded-[1.75rem] border border-white/10 bg-white/5 text-center">
        <CardContent className="space-y-3 p-8">
          <h2 className="text-lg font-semibold text-white">No records found</h2>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-400">
            New records will appear here once data becomes available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4 lg:hidden">
        {items.map((item) => (
          <Card
            key={getItemKey(item)}
            className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] py-0 text-white shadow-[0_18px_50px_rgba(2,6,23,0.14)]"
          >
            <CardContent className="p-5">{renderMobileCard(item)}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="hidden rounded-[2rem] border-white/8 bg-white/[0.03] py-0 text-white shadow-[0_22px_60px_rgba(2,6,23,0.18)] lg:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/8 hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={column.className ?? "px-5 py-4 text-slate-400"}
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
                  className="border-white/8 hover:bg-white/[0.03]"
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={column.cellClassName ?? "px-5 py-4 align-top"}
                    >
                      {column.render(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
