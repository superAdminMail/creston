import { Wallet } from "lucide-react";

import { getAdminTransactions } from "@/lib/service/getAdminTransactions";

import { SuperAdminPageHeader } from "../_components/SuperAdminPageHeader";
import { SuperAdminStatCard } from "../_components/SuperAdminStatCard";
import { TransactionTable } from "../../user/_components/TransactionTable";

function formatCurrencyCompact(value: number) {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (absolute >= 1_000) {
    return `$${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }

  return `$${value.toFixed(2)}`;
}

export default async function SuperAdminTransactionsPage() {
  const transactions = await getAdminTransactions();

  const creditCount = transactions.filter(
    (transaction) => transaction.direction === "CREDIT",
  ).length;
  const debitCount = transactions.filter(
    (transaction) => transaction.direction === "DEBIT",
  ).length;
  const totalVolume = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );
  const netMovement = transactions.reduce((sum, transaction) => {
    const amount = transaction.amount;
    return transaction.direction === "CREDIT" ? sum + amount : sum - amount;
  }, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <SuperAdminPageHeader
        backHref="/account/dashboard/super-admin"
        backLabel="Back to dashboard"
        title="Transactions"
        description="Platform-wide investment, savings, withdrawal, and earnings activity with a responsive table and live summary cards."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SuperAdminStatCard
          label="Total transactions"
          value={transactions.length}
          description="All transaction records currently available in the ledger."
        />
        <SuperAdminStatCard
          label="Credit entries"
          value={creditCount}
          description="Incoming flows such as savings deposits and earnings."
        />
        <SuperAdminStatCard
          label="Debit entries"
          value={debitCount}
          description="Outgoing flows such as withdrawals and investment funding."
        />
        <SuperAdminStatCard
          label="Net movement"
          value={formatCurrencyCompact(netMovement)}
          description="Credits minus debits across the returned transaction set."
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SuperAdminStatCard
          label="Gross volume"
          value={formatCurrencyCompact(totalVolume)}
          description="Total absolute value of all included transactions."
        />
        <SuperAdminStatCard
          label="Credit share"
          value={transactions.length ? `${Math.round((creditCount / transactions.length) * 100)}%` : "0%"}
          description="Share of transactions recorded as credits."
        />
        <SuperAdminStatCard
          label="Debit share"
          value={transactions.length ? `${Math.round((debitCount / transactions.length) * 100)}%` : "0%"}
          description="Share of transactions recorded as debits."
        />
        <SuperAdminStatCard
          label="Latest activity"
          value={transactions[0] ? transactions[0].createdAt.toLocaleDateString() : "—"}
          description="Most recent transaction date in this ledger snapshot."
        />
      </section>

      <div className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300/80">
              Super admin ledger
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
              Transaction history
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
              Review the full transaction timeline across investment, savings,
              withdrawal, and earnings events.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 sm:self-auto">
            <Wallet className="h-4 w-4 shrink-0 text-sky-300" />
            {transactions.length} records
          </div>
        </div>

        <TransactionTable transactions={transactions} />
      </div>
    </div>
  );
}
