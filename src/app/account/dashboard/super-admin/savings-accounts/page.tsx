import { getSuperAdminSavingsAccounts } from "@/actions/super-admin/savings-accounts/getSuperAdminSavingsAccounts";

import { SuperAdminStatCard } from "../_components/SuperAdminStatCard";
import { SavingsAccountsHeader } from "./_components/SavingsAccountsHeader";
import { SavingsAccountsTable } from "./_components/SavingsAccountsTable";

export default async function SuperAdminSavingsAccountsPage() {
  const data = await getSuperAdminSavingsAccounts();

  return (
    <div className="space-y-6">
      <SavingsAccountsHeader />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SuperAdminStatCard
          label="Total accounts"
          value={data.totalAccountsCount}
          description="All savings accounts in the platform."
        />
        <SuperAdminStatCard
          label="Active accounts"
          value={data.activeAccountsCount}
          description="Accounts currently open and accepting activity."
        />
        <SuperAdminStatCard
          label="Locked accounts"
          value={data.lockedAccountsCount}
          description="Accounts currently locked by policy or admin action."
        />
        <SuperAdminStatCard
          label="Total balance"
          value={data.totalBalance.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
          description="Combined balance across all savings accounts."
        />
      </section>

      <SavingsAccountsTable data={data} />
    </div>
  );
}
