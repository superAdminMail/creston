import { createInvestmentPlan } from "@/actions/super-admin/investment-plans/createInvestmentPlan";
import { getSuperAdminInvestmentPlans } from "@/actions/super-admin/investment-plans/getSuperAdminInvestmentPlans";
import { InvestmentModel } from "@/generated/prisma";
import { InvestmentPlanForm } from "../_components/InvestmentPlanForm";

export default async function NewInvestmentPlanPage() {
  const data = await getSuperAdminInvestmentPlans();
  const defaultLevels = ["CORE", "ADVANCED", "ELITE"] as const;

  return (
    <InvestmentPlanForm
      title="Create investment plan"
      description="Define the tier structure, category, and parent investment relationship for a live Havenstone investment plan."
      submitLabel="Create investment plan"
      cancelHref="/account/dashboard/super-admin/investment-plans"
      defaultValues={{
        investmentId: "",
        investmentSymbol: "",
        name: "",
        slug: "",
        description: "",
        period: data.filterOptions.periods[0]?.value ?? "LONG_TERM",
        investmentModel: InvestmentModel.FIXED,
        penaltyPeriodDays: "0",
        penaltyType: "",
        earlyWithdrawalPenaltyValue: "",
        maxPenaltyAmount: "",
        expectedReturnMin: "",
        expectedReturnMax: "",
        isLocked: false,
        allowWithdrawal: true,
        currency: "USD",
        seoTitle: "",
        seoDescription: "",
        seoImageFileId: "",
        sortOrder: "0",
        durationDays: "7",
        isActive: true,
        tiers: defaultLevels.map((level) => ({
          level,
          minAmount: "",
          maxAmount: "",
          fixedRoiPercent: "",
          projectedRoiMin: "",
          projectedRoiMax: "",
          isActive: true,
        })),
      }}
      investmentOptions={data.investmentOptions}
      formAction={createInvestmentPlan}
    />
  );
}
