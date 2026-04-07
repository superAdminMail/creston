"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";

const transactions = [
  {
    id: "1",
    type: "deposit",
    amount: 1000,
    status: "completed",
    method: "Crypto (USDT)",
    date: "2026-04-01",
  },
  {
    id: "2",
    type: "withdrawal",
    amount: 500,
    status: "pending",
    method: "Access Bank",
    date: "2026-04-03",
  },
  {
    id: "3",
    type: "earning",
    amount: 120,
    status: "completed",
    method: "Investment ROI",
    date: "2026-04-05",
  },
];

export default function TransactionsPage() {
  const [filter, setFilter] = useState("all");

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* 🔥 Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track all your financial activities
        </p>
      </div>

      {/* 🔥 Filters */}
      <div className="flex gap-2">
        {["all", "deposit", "withdrawal", "earning"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-md border transition ${
              filter === f
                ? "bg-blue-600 text-white border-blue-600"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 🔥 Transaction List */}
      <div className="rounded-xl border bg-white divide-y">
        {transactions
          .filter((tx) => filter === "all" || tx.type === filter)
          .map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 hover:bg-muted/40 transition"
            >
              {/* Left */}
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  {tx.type === "deposit" && (
                    <ArrowDownLeft className="h-4 w-4 text-green-600" />
                  )}
                  {tx.type === "withdrawal" && (
                    <ArrowUpRight className="h-4 w-4 text-red-600" />
                  )}
                  {tx.type === "earning" && (
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium capitalize">{tx.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.method} • {tx.date}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="text-right space-y-1">
                <p
                  className={`font-medium ${
                    tx.type === "withdrawal" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {tx.type === "withdrawal" ? "-" : "+"}${tx.amount}
                </p>

                <span
                  className={`text-xs px-2 py-1 rounded-md ${
                    tx.status === "completed"
                      ? "bg-green-100 text-green-600"
                      : tx.status === "pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* 🔥 Empty State */}
      {transactions.length === 0 && (
        <div className="border rounded-xl p-10 text-center text-sm text-muted-foreground">
          No transactions yet
        </div>
      )}
    </div>
  );
}
