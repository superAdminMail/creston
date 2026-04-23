import { notFound } from "next/navigation";

import { getSuperAdminInvestorById } from "@/actions/super-admin/investors/getSuperAdminInvestorById";

import { InvestorDetailsCard } from "../_components/InvestorDetailsCard";
import { InvestorDetailsHeader } from "../_components/InvestorDetailsHeader";

type PageProps = {
  params: Promise<{
    investorId: string;
  }>;
};

export default async function SuperAdminInvestorDetailsPage({
  params,
}: PageProps) {
  const { investorId } = await params;
  const investor = await getSuperAdminInvestorById(investorId);

  if (!investor) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <InvestorDetailsHeader investor={investor} />
      <InvestorDetailsCard investor={investor} />
    </div>
  );
}
