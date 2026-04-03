import { getSuperAdminInvestmentPlanById } from "@/actions/super-admin/investment-plans/getSuperAdminInvestmentPlanById";
import { updateInvestmentPlan } from "@/actions/super-admin/investment-plans/updateInvestmentPlan";
import { InvestmentPlanForm } from "../../_components/InvestmentPlanForm";

export default async function EditInvestmentPlanPage(
  props: PageProps<"/account/dashboard/super-admin/investment-plans/[investmentPlanId]/edit">,
) {
  const { investmentPlanId } = await props.params;
  const plan = await getSuperAdminInvestmentPlanById(investmentPlanId);

  return (
    <InvestmentPlanForm
      title="Edit investment plan"
      description="Update this plan's parent investment, category, term, and investable range while preserving its live catalog role."
      submitLabel="Save changes"
      cancelHref={`/account/dashboard/super-admin/investment-plans/${plan.id}`}
      defaultValues={plan.formDefaults}
      investmentOptions={plan.investmentOptions}
      formAction={updateInvestmentPlan.bind(null, plan.id)}
    />
  );
}
