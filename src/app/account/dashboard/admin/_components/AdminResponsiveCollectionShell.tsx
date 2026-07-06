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
  void renderMobileCard;

  if (items.length === 0) {
    return emptyState ? (
      <>{emptyState}</>
    ) : (
      <Card className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(8,17,37,0.98))] text-center shadow-[0_22px_60px_rgba(0,0,0,0.2)]">
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
      <Card className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,17,37,0.99))] py-0 text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-max">
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
          </div>
        </CardContent>
      </Card>
    </>
  );
}
