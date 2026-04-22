import { notFound } from "next/navigation";

import { getSuperAdminInvestmentPlanById } from "@/actions/super-admin/investment-plans/getSuperAdminInvestmentPlanById";
import { updateInvestmentPlan } from "@/actions/super-admin/investment-plans/updateInvestmentPlan";
import { InvestmentPlanForm } from "../../_components/InvestmentPlanForm";

type PageProps = {
  params: Promise<{
    investmentPlanId: string;
  }>;
};

export default async function EditInvestmentPlanPage({ params }: PageProps) {
  const { investmentPlanId } = await params;

  const plan = await getSuperAdminInvestmentPlanById(investmentPlanId);

  if (!plan) {
    notFound();
  }

  return (
    <InvestmentPlanForm
      title="Edit investment plan"
      description="Update the plan's investment model, term controls, return settings, and SEO metadata while preserving its live catalog role."
      submitLabel="Save changes"
      cancelHref={`/account/dashboard/super-admin/investment-plans/${plan.id}`}
      defaultValues={plan.formDefaults}
      investmentOptions={plan.investmentOptions}
      formAction={updateInvestmentPlan.bind(null, plan.id)}
    />
  );
}
