"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Transactions</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor all financial activity in your account
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-3 py-1.5 text-xs rounded-full border transition ${
              filter === option.value
                ? "bg-[#3c9ee0] text-white border-[#3c9ee0]"
                : "text-slate-400 border-white/10 hover:bg-white/5"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl divide-y divide-white/10">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-sm text-center text-slate-400">
            No transactions found for this filter.
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-5 hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <TransactionIcon transaction={transaction} />
                </div>

                <div>
                  <p className="text-sm font-medium text-white capitalize">
                    {getTransactionLabel(transaction)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {getTransactionMeta(transaction)}
                  </p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <p
                  className={`font-medium ${
                    transaction.direction === "DEBIT"
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {transaction.direction === "DEBIT" ? "-" : "+"}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </p>

                <span className="text-[10px] px-2 py-1 rounded-full border border-white/10 text-slate-400">
                  {formatEnumLabel(transaction.status)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
