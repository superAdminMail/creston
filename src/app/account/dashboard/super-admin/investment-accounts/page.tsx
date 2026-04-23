import { getSuperAdminInvestmentAccounts } from "@/actions/super-admin/investment-accounts/getSuperAdminInvestmentAccounts";
import { InvestmentAccountsHeader } from "./_components/InvestmentAccountsHeader";
import { InvestmentAccountsTable } from "./_components/InvestmentAccountsTable";

export default async function SuperAdminInvestmentAccountsPage() {
  const data = await getSuperAdminInvestmentAccounts();

  return (
    <div className="space-y-6">
      <InvestmentAccountsHeader />

      <section className="grid gap-4 md:grid-cols-4">
        <div className="card-premium rounded-[1.75rem] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Total accounts
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {data.totalAccountsCount}
          </p>
        </div>
        <div className="card-premium rounded-[1.75rem] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Active accounts
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {data.activeAccountsCount}
          </p>
        </div>
        <div className="card-premium rounded-[1.75rem] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Pending accounts
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {data.pendingAccountsCount}
          </p>
        </div>
        <div className="card-premium rounded-[1.75rem] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Total balance
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {data.totalBalance.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>
        </div>
      </section>

      <InvestmentAccountsTable data={data} />
    </div>
  );
}
