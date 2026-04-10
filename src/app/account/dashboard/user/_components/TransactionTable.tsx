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

import { Card, CardContent } from "@/components/ui/card";

export function TransactionTable({
  transactions,
}: {
  transactions: TransactionItem[];
}) {
  return (
    <div className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Transaction History
        </h2>
      </div>

      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-slate-400">Type</TableHead>
              <TableHead className="text-slate-400">Reference</TableHead>
              <TableHead className="text-slate-400">Plan</TableHead>
              <TableHead className="text-slate-400">Amount</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400">Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {transactions.map((tx) => (
              <TableRow
                key={tx.id}
                className="border-white/5 hover:bg-white/[0.04]"
              >
                <TableCell>
                  <TypeBadge type={tx.type} />
                </TableCell>

                <TableCell className="text-slate-300">{tx.reference}</TableCell>

                <TableCell className="text-slate-400">
                  {tx.planName ?? "-"}
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

                <TableCell className="text-slate-500">
                  {formatDateLabel(tx.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {transactions.length === 0 && (
          <div className="py-10 text-center text-slate-500">
            No transactions yet
          </div>
        )}
      </div>

      <div className="space-y-4 lg:hidden">
        {transactions.map((tx) => (
          <Card
            key={tx.id}
            className="border-white/8 bg-white/[0.04] backdrop-blur-xl"
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <TypeBadge type={tx.type} />
                <StatusBadge status={tx.status} />
              </div>

              <div
                className={cn(
                  "text-lg font-semibold",
                  tx.direction === "CREDIT"
                    ? "text-emerald-400"
                    : "text-red-400",
                )}
              >
                {tx.direction === "CREDIT" ? "+" : "-"}
                {formatCurrency(tx.amount, tx.currency)}
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <p>Ref: {tx.reference}</p>
                <p>Plan: {tx.planName ?? "-"}</p>
                <p>{formatDateLabel(tx.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {transactions.length === 0 && (
          <div className="py-10 text-center text-slate-500">
            No transactions yet
          </div>
        )}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const styles = {
    INVESTMENT: "bg-blue-500/10 text-blue-300",
    WITHDRAWAL: "bg-red-500/10 text-red-300",
    EARNING: "bg-emerald-500/10 text-emerald-300",
    SAVINGS: "bg-amber-500/10 text-amber-300",
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
    PENDING: "bg-yellow-500/10 text-yellow-300",
    APPROVED: "bg-blue-500/10 text-blue-300",
    PROCESSING: "bg-purple-500/10 text-purple-300",
    COMPLETED: "bg-emerald-500/10 text-emerald-300",
    CONFIRMED: "bg-emerald-500/10 text-emerald-300",
    PAID: "bg-emerald-500/10 text-emerald-300",
    REJECTED: "bg-red-500/10 text-red-300",
    CANCELLED: "bg-red-500/10 text-red-300",
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
