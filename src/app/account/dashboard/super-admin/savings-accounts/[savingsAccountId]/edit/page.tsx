import { notFound } from "next/navigation";

import { getSuperAdminSavingsAccountById } from "@/actions/super-admin/savings-accounts/getSuperAdminSavingsAccountById";
import { updateSuperAdminSavingsAccount } from "@/actions/super-admin/savings-accounts/updateSuperAdminSavingsAccount";
import { SavingsAccountForm } from "../../../_components/SavingsAccountForm";

type PageProps = {
  params: Promise<{
    savingsAccountId: string;
  }>;
};

export default async function EditSuperAdminSavingsAccountPage({
  params,
}: PageProps) {
  const { savingsAccountId } = await params;
  const account = await getSuperAdminSavingsAccountById(savingsAccountId);

  if (!account) {
    notFound();
  }

  return (
    <SavingsAccountForm
      title="Edit savings account"
      description="Update lifecycle state, target amount, and lock settings for this savings account."
      submitLabel="Save changes"
      cancelHref={`/account/dashboard/super-admin/savings-accounts/${account.id}`}
      defaultValues={account.formDefaults}
      formAction={updateSuperAdminSavingsAccount.bind(null, account.id)}
    />
  );
}
