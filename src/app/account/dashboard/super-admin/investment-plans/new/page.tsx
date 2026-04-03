import { createInvestmentPlan } from "@/actions/super-admin/investment-plans/createInvestmentPlan";
import { getSuperAdminInvestmentPlans } from "@/actions/super-admin/investment-plans/getSuperAdminInvestmentPlans";
import { InvestmentPlanForm } from "../_components/InvestmentPlanForm";

export default async function NewInvestmentPlanPage() {
  const data = await getSuperAdminInvestmentPlans();

  return (
    <InvestmentPlanForm
      title="Create investment plan"
      description="Define the contribution range, category, and parent investment relationship for a live Havenstone investment plan."
      submitLabel="Create investment plan"
      cancelHref="/account/dashboard/super-admin/investment-plans"
      defaultValues={{
        investmentId: "",
        name: "",
        slug: "",
        description: "",
        category: data.filterOptions.categories[0]?.value ?? "SAVINGS",
        period: data.filterOptions.periods[0]?.value ?? "LONG_TERM",
        minAmount: "",
        maxAmount: "",
        currency: "USD",
        isActive: true,
      }}
      investmentOptions={data.investmentOptions}
      formAction={createInvestmentPlan}
    />
  );
}
