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
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-sky-800 dark:text-sky-400">
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          Investment accounts
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Create investment account
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Choose an investment plan to open a new account and keep your
            investment activity organized in one place.
          </p>
        </div>
      </div>

      <CreateInvestmentAccountForm plans={plans} />
    </div>
  );
}
