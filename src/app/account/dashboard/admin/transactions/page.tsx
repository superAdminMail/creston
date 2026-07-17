import { getAdminTransactions } from "@/lib/service/getAdminTransactions";
import { AdminTransactionsClient } from "./_components/AdminTransactionsClient";

export default async function AdminTransactionsPage() {
  const transactions = await getAdminTransactions();

  return (
    <div className="space-y-6">
      <div className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300/80">
          Admin Ledger
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Transactions</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Review platform-wide investment, savings, withdrawal, and earnings
          activity across the dashboard.
        </p>
      </div>

      <AdminTransactionsClient transactions={transactions} />
    </div>
  );
}
