import { getSuperAdminInvestmentAccounts } from "@/actions/super-admin/investment-accounts/getSuperAdminInvestmentAccounts";
import { SuperAdminStatCard } from "../_components/SuperAdminStatCard";
import { InvestmentAccountsHeader } from "./_components/InvestmentAccountsHeader";
import { InvestmentAccountsTable } from "./_components/InvestmentAccountsTable";

export default async function SuperAdminInvestmentAccountsPage() {
  const data = await getSuperAdminInvestmentAccounts();

  return (
    <div className="space-y-6">
      <InvestmentAccountsHeader />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SuperAdminStatCard
          label="Total accounts"
          value={data.totalAccountsCount}
          description="All investment accounts in the platform."
        />
        <SuperAdminStatCard
          label="Active accounts"
          value={data.activeAccountsCount}
          description="Accounts currently open and active."
        />
        <SuperAdminStatCard
          label="Pending accounts"
          value={data.pendingAccountsCount}
          description="Accounts waiting to be activated."
        />
        <SuperAdminStatCard
          label="Total balance"
          value={data.totalBalance.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
          description="Combined balance across all investment accounts."
        />
      </section>

      <InvestmentAccountsTable data={data} />
    </div>
  );
}
