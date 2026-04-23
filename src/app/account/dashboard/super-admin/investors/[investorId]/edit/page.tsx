import { notFound } from "next/navigation";

import { getSuperAdminInvestorById } from "@/actions/super-admin/investors/getSuperAdminInvestorById";
import { updateSuperAdminInvestor } from "@/actions/super-admin/investors/updateSuperAdminInvestor";
import { InvestorForm } from "../../../_components/InvestorForm";

type PageProps = {
  params: Promise<{
    investorId: string;
  }>;
};

export default async function EditSuperAdminInvestorPage({
  params,
}: PageProps) {
  const { investorId } = await params;
  const investor = await getSuperAdminInvestorById(investorId);

  if (!investor) {
    notFound();
  }

  return (
    <InvestorForm
      title="Edit investor profile"
      description="Update contact details, identity data, and verification state for this investor profile."
      submitLabel="Save changes"
      cancelHref={`/account/dashboard/super-admin/investors/${investor.id}`}
      defaultValues={investor.formDefaults}
      formAction={updateSuperAdminInvestor.bind(null, investor.id)}
    />
  );
}
