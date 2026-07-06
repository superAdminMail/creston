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
  renderMobileCard: (item: TItem) => ReactNode;
};

export function SuperAdminCollection<TItem>({
  items,
  columns,
  getItemKey,
  renderMobileCard,
}: SuperAdminCollectionProps<TItem>) {
  void renderMobileCard;

  return (
    <>
      <Card className="rounded-[2rem] border-white/8 bg-white/[0.03] py-0 text-white shadow-[0_22px_60px_rgba(2,6,23,0.18)]">
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
