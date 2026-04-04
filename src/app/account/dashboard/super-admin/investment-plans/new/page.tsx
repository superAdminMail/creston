import { createInvestmentPlan } from "@/actions/super-admin/investment-plans/createInvestmentPlan";
import { getSuperAdminInvestmentPlans } from "@/actions/super-admin/investment-plans/getSuperAdminInvestmentPlans";
import { InvestmentPlanForm } from "../_components/InvestmentPlanForm";

export default async function NewInvestmentPlanPage() {
  const data = await getSuperAdminInvestmentPlans();
  const defaultLevels = ["STARTER", "GROWTH", "PREMIUM"] as const;

  return (
    <InvestmentPlanForm
      title="Create investment plan"
      description="Define the tier structure, category, and parent investment relationship for a live Havenstone investment plan."
      submitLabel="Create investment plan"
      cancelHref="/account/dashboard/super-admin/investment-plans"
      defaultValues={{
        investmentId: "",
        name: "",
        slug: "",
        description: "",
        period: data.filterOptions.periods[0]?.value ?? "LONG_TERM",
        currency: "USD",
        isActive: true,
        tiers: defaultLevels.map((level) => ({
          level,
          minAmount: "",
          maxAmount: "",
          roiPercent: "",
          isActive: true,
        })),
      }}
      investmentOptions={data.investmentOptions}
      formAction={createInvestmentPlan}
    />
  );
}
