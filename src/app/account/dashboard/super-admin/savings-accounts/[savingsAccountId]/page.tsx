import { notFound } from "next/navigation";

import { getSuperAdminSavingsAccountById } from "@/actions/super-admin/savings-accounts/getSuperAdminSavingsAccountById";

import { SavingsAccountDetailsCard } from "../_components/SavingsAccountDetailsCard";
import { SavingsAccountDetailsHeader } from "../_components/SavingsAccountDetailsHeader";

type PageProps = {
  params: Promise<{
    savingsAccountId: string;
  }>;
};

export default async function SuperAdminSavingsAccountDetailsPage({
  params,
}: PageProps) {
  const { savingsAccountId } = await params;
  const account = await getSuperAdminSavingsAccountById(savingsAccountId);

  if (!account) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SavingsAccountDetailsHeader account={account} />
      <SavingsAccountDetailsCard account={account} />
    </div>
  );
}
