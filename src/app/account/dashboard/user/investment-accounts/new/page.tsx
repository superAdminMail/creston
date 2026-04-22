import { redirect } from "next/navigation";

import { InvestmentCatalogStatus } from "@/generated/prisma";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { resolveInvestmentTierRoiPercentValue } from "@/lib/investment/formatInvestmentTierReturnLabel";
import { prisma } from "@/lib/prisma";

import { CreateInvestmentAccountForm } from "../../_components/CreateInvestmentAccountForm";

export default async function Page() {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    redirect("/auth/login");
  }

  const investorProfile = await prisma.investorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!investorProfile) {
    redirect("/account/dashboard/user/investment-profile");
  }

  const rawPlans = await prisma.investmentPlan.findMany({
    where: {
      isActive: true,
      investment: {
        isActive: true,
        status: InvestmentCatalogStatus.ACTIVE,
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      investmentModel: true,
      period: true,
      currency: true,
      investment: {
        select: {
          name: true,
          type: true,
        },
      },
      tiers: {
        where: { isActive: true },
        orderBy: { level: "asc" },
        select: {
          fixedRoiPercent: true,
          projectedRoiMin: true,
          projectedRoiMax: true,
          minAmount: true,
          maxAmount: true,
        },
      },
    },
  });

  const plans = rawPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description:
      plan.description?.trim() ||
      "Structured investment plan aligned to your portfolio.",
    investmentModelLabel: formatEnumLabel(plan.investmentModel),
    periodLabel: formatEnumLabel(plan.period),
    currency: plan.currency,
    investmentName: plan.investment.name,
    investmentTypeLabel: formatEnumLabel(plan.investment.type),
    tiers: plan.tiers.map((tier) => ({
      roiPercent:
        resolveInvestmentTierRoiPercentValue({
          investmentModel: plan.investmentModel,
          fixedRoiPercent: tier.fixedRoiPercent
            ? tier.fixedRoiPercent.toNumber()
            : null,
          projectedRoiMin: tier.projectedRoiMin
            ? tier.projectedRoiMin.toNumber()
            : null,
          projectedRoiMax: tier.projectedRoiMax
            ? tier.projectedRoiMax.toNumber()
            : null,
        }) ?? 0,
      minAmount: tier.minAmount.toNumber(),
      maxAmount: tier.maxAmount.toNumber(),
    })),
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white/90">
          Create investment account
        </h1>
        <p className="text-sm text-muted-foreground">
          Create a new investment account to track your investments.
        </p>
      </div>

      <CreateInvestmentAccountForm plans={plans} />
    </div>
  );
}
