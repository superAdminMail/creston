"use client";

import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import type { TransactionItem } from "@/lib/service/getUserTransactions";
import { cn } from "@/lib/utils";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export function TransactionTable({
  transactions,
}: {
  transactions: TransactionItem[];
}) {
  return (
    <div className="rounded-[1.8rem] border border-border/70 bg-white/80 p-5 shadow-sm dark:bg-white/[0.04] sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
          Transaction History
        </h2>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 dark:border-white/10">
              <TableHead className="text-sky-700/90 dark:text-sky-300/80">
                Type
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">
                Reference
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">
                Plan
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">
                Amount
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">
                Status
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {transactions.map((tx) => (
              <TableRow
                key={tx.id}
                className="border-border/60 hover:bg-sky-50/70 dark:border-white/10 dark:hover:bg-white/[0.04]"
              >
                <TableCell>
                  <TypeBadge type={tx.type} />
                </TableCell>

                <TableCell className="text-slate-700 dark:text-slate-300">
                  {tx.reference}
                </TableCell>

                <TableCell className="text-slate-600 dark:text-slate-400">
                  <div>{tx.planName ?? "-"}</div>
                  {tx.description ? (
                    <div className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-500">
                      {tx.description}
                    </div>
                  ) : null}
                </TableCell>

                <TableCell
                  className={cn(
                    "font-medium",
                    tx.direction === "CREDIT"
                      ? "text-emerald-400"
                      : "text-red-400",
                  )}
                >
                  {tx.direction === "CREDIT" ? "+" : "-"}
                  {formatCurrency(tx.amount, tx.currency)}
                </TableCell>

                <TableCell>
                  <StatusBadge status={tx.status} />
                </TableCell>

                <TableCell className="text-slate-500 dark:text-slate-500">
                  {formatDateLabel(tx.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {transactions.length === 0 && (
          <div className="py-10 text-center text-slate-500 dark:text-slate-400">
            No transactions yet
          </div>
        )}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const styles = {
    INVESTMENT: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    WITHDRAWAL: "bg-red-500/10 text-red-500 dark:text-red-300",
    EARNING: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    ADJUSTMENT: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    SAVINGS: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  };

  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium",
        styles[type as keyof typeof styles] ?? "bg-white/10 text-slate-300",
      )}
    >
      {formatEnumLabel(type)}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    APPROVED: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    PROCESSING: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    CONFIRMED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    PAID: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    REJECTED: "bg-red-500/10 text-red-600 dark:text-red-300",
    CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-300",
  };

  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium",
        map[status] ?? "bg-white/10 text-slate-300",
      )}
    >
      {formatEnumLabel(status)}
    </span>
  );
}
