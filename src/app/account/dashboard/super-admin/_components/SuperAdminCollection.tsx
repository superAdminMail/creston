import type { ReactNode } from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
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

type SuperAdminCollectionColumn<TItem> = {
  key: string;
  header: string;
  className?: string;
  cellClassName?: string;
  render: (item: TItem) => ReactNode;
};

type SuperAdminCollectionProps<TItem> = {
  items: TItem[];
  columns: SuperAdminCollectionColumn<TItem>[];
  getItemKey: (item: TItem) => string;
};

export function SuperAdminCollection<TItem>({
  items,
  columns,
  getItemKey,
}: SuperAdminCollectionProps<TItem>) {
  return (
    <>
      <Card
        className={cn(
          DASHBOARD_PAGE_SURFACE_CLASS,
          "overflow-hidden py-0",
        )}
      >
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-max">
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={
                      column.className ??
                      "px-5 py-4 text-slate-500 dark:text-slate-400"
                    }
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
                  className="border-border/60 hover:bg-slate-50/80 dark:hover:bg-white/[0.03]"
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={
                        column.cellClassName ?? "px-5 py-4 align-top"
                      }
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
