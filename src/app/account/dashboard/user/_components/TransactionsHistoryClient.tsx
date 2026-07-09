"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  BadgePercent,
  TrendingUp,
} from "lucide-react";

import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import type { TransactionItem } from "@/lib/service/getUserTransactions";

type FilterValue = "all" | TransactionItem["type"];

const filters: Array<{ label: string; value: FilterValue }> = [
  { label: "all", value: "all" },
  { label: "investment", value: "INVESTMENT" },
  { label: "withdrawal", value: "WITHDRAWAL" },
  { label: "earning", value: "EARNING" },
  { label: "adjustment", value: "ADJUSTMENT" },
  { label: "savings", value: "SAVINGS" },
];

function getTransactionLabel(transaction: TransactionItem) {
  if (transaction.type === "SAVINGS" && transaction.savingsType) {
    return formatEnumLabel(transaction.savingsType);
  }

  return formatEnumLabel(transaction.type);
}

function getTransactionMeta(transaction: TransactionItem) {
  const primary =
    transaction.description ?? transaction.planName ?? transaction.reference;

  return `${primary} - ${formatDateLabel(transaction.createdAt)}`;
}

function TransactionIcon({ transaction }: { transaction: TransactionItem }) {
  if (transaction.type === "WITHDRAWAL") {
    return <ArrowUpRight className="h-4 w-4 text-red-400" />;
  }

  if (transaction.type === "EARNING") {
    return <TrendingUp className="h-4 w-4 text-[#3c9ee0]" />;
  }

  if (transaction.type === "SAVINGS") {
    return <PiggyBank className="h-4 w-4 text-amber-300" />;
  }

  if (transaction.type === "ADJUSTMENT") {
    return <BadgePercent className="h-4 w-4 text-amber-300" />;
  }

  return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
}

export default function TransactionsHistoryClient({
  transactions,
}: {
  transactions: TransactionItem[];
}) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filteredTransactions = transactions.filter(
    (transaction) => filter === "all" || transaction.type === filter,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Monitor all financial activity in your account
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              filter === option.value
                ? "bg-[#3c9ee0] text-white border-[#3c9ee0]"
                : "border-slate-200/80 bg-white/80 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/[0.04]">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-600 dark:text-slate-400">
            No transactions found for this filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-200/80 dark:divide-white/10">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-5 transition hover:bg-slate-50 dark:hover:bg-white/[0.06]"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl border border-slate-200/80 bg-white/80 p-2 dark:border-white/10 dark:bg-white/[0.04]">
                    <TransactionIcon transaction={transaction} />
                  </div>

                  <div>
                    <p className="text-sm font-medium capitalize text-slate-950 dark:text-white">
                      {getTransactionLabel(transaction)}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {getTransactionMeta(transaction)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-right">
                  <p
                    className={`font-medium ${
                      transaction.direction === "DEBIT"
                        ? "text-red-500 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {transaction.direction === "DEBIT" ? "-" : "+"}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>

                  <span className="rounded-full border border-slate-200/80 px-2 py-1 text-[10px] text-slate-500 dark:border-white/10 dark:text-slate-400">
                    {formatEnumLabel(transaction.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
