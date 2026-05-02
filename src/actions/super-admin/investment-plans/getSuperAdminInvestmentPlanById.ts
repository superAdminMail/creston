import { notFound } from "next/navigation";
import { InvestmentModel, Prisma } from "@/generated/prisma";
import type {
  InvestmentPeriod,
  InvestmentTierLevel,
  PenaltyType,
} from "@/generated/prisma";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
  formatTierLevel,
} from "@/lib/formatters/formatters";
import {
  getSuperAdminInvestmentPlans,
  type SuperAdminInvestmentOption,
} from "./getSuperAdminInvestmentPlans";
import { decimalToNumber } from "@/lib/services/investment/decimal";

export type SuperAdminInvestmentPlanDetails = {
  id: string;
  investmentId: string;
  investmentName: string;
  name: string;
  slug: string;
  description: string;
  period: InvestmentPeriod;
  periodLabel: string;
  currency: string;
  investmentModel: InvestmentModel;
  penaltyPeriodDays: number;
  penaltyType: PenaltyType | null;
  earlyWithdrawalPenaltyValue: number | null;
  maxPenaltyAmount: number | null;
  expectedReturnMin: number | null;
  expectedReturnMax: number | null;
  isLocked: boolean;
  allowWithdrawal: boolean;
  seoTitle: string;
  seoDescription: string;
  seoImageFileId: string | null;
  sortOrder: number;
  durationDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tiersCountLabel: string;
  tierRangeLabel: string | null;
  tiers: Array<{
    id: string;
    level: InvestmentTierLevel;
    levelLabel: string;
    minAmount: number;
    maxAmount: number;
    fixedRoiPercent: number | null;
    projectedRoiMin: number | null;
    projectedRoiMax: number | null;
    returnLabel: string | null;
    isActive: boolean;
    minAmountLabel: string;
    maxAmountLabel: string;
  }>;
  formDefaults: {
    investmentId: string;
    name: string;
    slug: string;
    description: string;
    period: InvestmentPeriod;
    investmentModel: InvestmentModel;
    penaltyPeriodDays: string;
    penaltyType: PenaltyType | "";
    earlyWithdrawalPenaltyValue: string;
    maxPenaltyAmount: string;
    expectedReturnMin: string;
    expectedReturnMax: string;
    isLocked: boolean;
    allowWithdrawal: boolean;
    currency: string;
    seoTitle: string;
    seoDescription: string;
    seoImageFileId: string;
    sortOrder: string;
    durationDays: string;
    isActive: boolean;
    tiers: Array<{
      level: InvestmentTierLevel;
      minAmount: string;
      maxAmount: string;
      fixedRoiPercent: string;
      projectedRoiMin: string;
      projectedRoiMax: string;
      isActive: boolean;
    }>;
  };
  investmentOptions: SuperAdminInvestmentOption[];
};

type SuperAdminInvestmentPlanRecord = {
  id: string;
  investmentId: string;
  investmentName: string;
  name: string;
  slug: string;
  description: string | null;
  period: InvestmentPeriod;
  currency: string;
  investmentModel: InvestmentModel;
  penaltyPeriodDays: number;
  penaltyType: PenaltyType | null;
  earlyWithdrawalPenaltyValue: Prisma.Decimal | null;
  maxPenaltyAmount: Prisma.Decimal | null;
  expectedReturnMin: Prisma.Decimal | null;
  expectedReturnMax: Prisma.Decimal | null;
  isLocked: boolean;
  allowWithdrawal: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoImageFileId: string | null;
  sortOrder: number;
  durationDays: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tiers: Array<{
    id: string;
    level: InvestmentTierLevel;
    minAmount: Prisma.Decimal;
    maxAmount: Prisma.Decimal;
    fixedRoiPercent: Prisma.Decimal | null;
    projectedRoiMin: Prisma.Decimal | null;
    projectedRoiMax: Prisma.Decimal | null;
    isActive: boolean;
  }>;
};

function decimalValue(value: Prisma.Decimal | null | undefined) {
  return value ? decimalToNumber(value) : null;
}

function formatTierReturnLabel(
  investmentModel: InvestmentModel,
  tier: {
    fixedRoiPercent: Prisma.Decimal | null;
    projectedRoiMin: Prisma.Decimal | null;
    projectedRoiMax: Prisma.Decimal | null;
  },
) {
  const fixedRoiPercent = decimalValue(tier.fixedRoiPercent);
  const projectedRoiMin = decimalValue(tier.projectedRoiMin);
  const projectedRoiMax = decimalValue(tier.projectedRoiMax);

  if (investmentModel === InvestmentModel.FIXED) {
    return fixedRoiPercent !== null
      ? `${fixedRoiPercent.toFixed(2)}% ROI`
      : null;
  }

  if (projectedRoiMin === null && projectedRoiMax === null) {
    return null;
  }

  if (projectedRoiMin !== null && projectedRoiMax !== null) {
    return projectedRoiMin === projectedRoiMax
      ? `${projectedRoiMin.toFixed(2)}% projected ROI`
      : `${projectedRoiMin.toFixed(2)}% - ${projectedRoiMax.toFixed(2)}% projected ROI`;
  }

  return `${(projectedRoiMin ?? projectedRoiMax ?? 0).toFixed(2)}% projected ROI`;
}

async function loadSuperAdminInvestmentPlanRecord(
  investmentPlanId: string,
): Promise<SuperAdminInvestmentPlanRecord> {
  try {
    const plan = await prisma.investmentPlan.findUnique({
      where: { id: investmentPlanId },
      select: {
        id: true,
        investmentId: true,
        name: true,
        slug: true,
        description: true,
        period: true,
        currency: true,
        investmentModel: true,
        penaltyPeriodDays: true,
        penaltyType: true,
        earlyWithdrawalPenaltyValue: true,
        maxPenaltyAmount: true,
        expectedReturnMin: true,
        expectedReturnMax: true,
        isLocked: true,
        allowWithdrawal: true,
        seoTitle: true,
        seoDescription: true,
        seoImageFileId: true,
        sortOrder: true,
        durationDays: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        investment: {
          select: {
            name: true,
          },
        },
        tiers: {
          orderBy: {
            level: "asc",
          },
          select: {
            id: true,
            level: true,
            minAmount: true,
            maxAmount: true,
            fixedRoiPercent: true,
            projectedRoiMin: true,
            projectedRoiMax: true,
            isActive: true,
          },
        },
      },
    });

    if (plan) {
      const { investment, ...planRecord } = plan;

      return {
        ...planRecord,
        investmentName: investment.name,
      } as SuperAdminInvestmentPlanRecord;
    }
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientValidationError)) {
      throw error;
    }
  }

  const [planRows, tierRows] = await Promise.all([
    prisma.$queryRaw<
      Array<{
        id: string;
        investmentId: string;
        name: string;
        slug: string;
        description: string | null;
        period: InvestmentPeriod;
        currency: string;
        investmentModel: InvestmentModel;
        penaltyPeriodDays: number;
        penaltyType: PenaltyType | null;
        earlyWithdrawalPenaltyValue: Prisma.Decimal | null;
        maxPenaltyAmount: Prisma.Decimal | null;
        expectedReturnMin: Prisma.Decimal | null;
        expectedReturnMax: Prisma.Decimal | null;
        isLocked: boolean;
        allowWithdrawal: boolean;
        seoTitle: string | null;
        seoDescription: string | null;
        seoImageFileId: string | null;
        sortOrder: number;
        durationDays: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        investmentName: string;
      }>
    >`
      SELECT
        ip."id",
        ip."investmentId",
        ip."name",
        ip."slug",
        ip."description",
        ip."period",
        ip."currency",
        ip."investmentModel",
        ip."penaltyPeriodDays",
        ip."penaltyType",
        ip."earlyWithdrawalPenaltyValue",
        ip."maxPenaltyAmount",
        ip."expectedReturnMin",
        ip."expectedReturnMax",
        ip."isLocked",
        ip."allowWithdrawal",
        ip."seoTitle",
        ip."seoDescription",
        ip."seoImageFileId",
        ip."sortOrder",
        ip."durationDays",
        ip."isActive",
        ip."createdAt",
        ip."updatedAt",
        i."name" AS "investmentName"
      FROM "investment_plan" ip
      INNER JOIN "investment" i ON i."id" = ip."investmentId"
      WHERE ip."id" = ${investmentPlanId}
      LIMIT 1
    `,
    prisma.$queryRaw<
      Array<{
        id: string;
        level: InvestmentTierLevel;
        minAmount: Prisma.Decimal;
        maxAmount: Prisma.Decimal;
        fixedRoiPercent: Prisma.Decimal | null;
        projectedRoiMin: Prisma.Decimal | null;
        projectedRoiMax: Prisma.Decimal | null;
        isActive: boolean;
      }>
    >`
      SELECT
        t."id",
        t."level",
        t."minAmount",
        t."maxAmount",
        t."fixedRoiPercent",
        t."projectedRoiMin",
        t."projectedRoiMax",
        t."isActive"
      FROM "investment_plan_tier" t
      WHERE t."investmentPlanId" = ${investmentPlanId}
      ORDER BY t."level" ASC
    `,
  ]);

  const planRow = planRows[0];

  if (!planRow) {
    notFound();
  }

  return {
    id: planRow.id,
    investmentId: planRow.investmentId,
    investmentName: planRow.investmentName,
    name: planRow.name,
    slug: planRow.slug,
    description: planRow.description,
    period: planRow.period,
    currency: planRow.currency,
    investmentModel: planRow.investmentModel,
    penaltyPeriodDays: planRow.penaltyPeriodDays,
    penaltyType: planRow.penaltyType,
    earlyWithdrawalPenaltyValue: planRow.earlyWithdrawalPenaltyValue,
    maxPenaltyAmount: planRow.maxPenaltyAmount,
    expectedReturnMin: planRow.expectedReturnMin,
    expectedReturnMax: planRow.expectedReturnMax,
    isLocked: planRow.isLocked,
    allowWithdrawal: planRow.allowWithdrawal,
    seoTitle: planRow.seoTitle,
    seoDescription: planRow.seoDescription,
    seoImageFileId: planRow.seoImageFileId,
    sortOrder: planRow.sortOrder,
    durationDays: planRow.durationDays,
    isActive: planRow.isActive,
    createdAt: planRow.createdAt,
    updatedAt: planRow.updatedAt,
    tiers: tierRows,
  };
}

export async function getSuperAdminInvestmentPlanById(
  investmentPlanId: string,
): Promise<SuperAdminInvestmentPlanDetails> {
  await requireSuperAdminAccess();

  const [plan, planData] = await Promise.all([
    loadSuperAdminInvestmentPlanRecord(investmentPlanId),
    getSuperAdminInvestmentPlans(),
  ]);

  if (!plan) {
    notFound();
  }

  const tiers = plan.tiers.map((tier) => ({
    id: tier.id,
    level: tier.level,
    levelLabel: formatTierLevel(tier.level),
    minAmount: decimalToNumber(tier.minAmount),
    maxAmount: decimalToNumber(tier.maxAmount),
    fixedRoiPercent: decimalValue(tier.fixedRoiPercent),
    projectedRoiMin: decimalValue(tier.projectedRoiMin),
    projectedRoiMax: decimalValue(tier.projectedRoiMax),
    returnLabel: formatTierReturnLabel(plan.investmentModel, tier),
    isActive: tier.isActive,
    minAmountLabel: formatCurrency(decimalToNumber(tier.minAmount), plan.currency),
    maxAmountLabel: formatCurrency(decimalToNumber(tier.maxAmount), plan.currency),
  }));
  const activeTiers = tiers.filter((tier) => tier.isActive);

  return {
    id: plan.id,
    investmentId: plan.investmentId,
    investmentName: plan.investmentName,
    name: plan.name,
    slug: plan.slug,
    description: plan.description?.trim() || "No description provided.",
    period: plan.period,
    periodLabel: formatEnumLabel(plan.period),
    currency: plan.currency,
    investmentModel: plan.investmentModel,
    penaltyPeriodDays: plan.penaltyPeriodDays,
    penaltyType: plan.penaltyType,
    earlyWithdrawalPenaltyValue: decimalValue(plan.earlyWithdrawalPenaltyValue),
    maxPenaltyAmount: decimalValue(plan.maxPenaltyAmount),
    expectedReturnMin: decimalValue(plan.expectedReturnMin),
    expectedReturnMax: decimalValue(plan.expectedReturnMax),
    isLocked: plan.isLocked,
    allowWithdrawal: plan.allowWithdrawal,
    seoTitle: plan.seoTitle ?? "",
    seoDescription: plan.seoDescription ?? "",
    seoImageFileId: plan.seoImageFileId,
    sortOrder: plan.sortOrder,
    durationDays: plan.durationDays,
    isActive: plan.isActive,
    createdAt: formatDateLabel(plan.createdAt),
    updatedAt: formatDateLabel(plan.updatedAt),
    tiersCountLabel:
      activeTiers.length === 1
        ? "1 active tier"
        : `${activeTiers.length} active tiers`,
    tierRangeLabel:
      activeTiers.length > 0
        ? `${formatCurrency(
            Math.min(...activeTiers.map((tier) => tier.minAmount)),
            plan.currency,
          )} - ${formatCurrency(
            Math.max(...activeTiers.map((tier) => tier.maxAmount)),
            plan.currency,
          )}`
        : null,
    tiers,
    formDefaults: {
      investmentId: plan.investmentId,
      name: plan.name,
      slug: plan.slug,
      description: plan.description ?? "",
      period: plan.period,
      investmentModel: plan.investmentModel,
      penaltyPeriodDays: String(plan.penaltyPeriodDays),
      penaltyType: plan.penaltyType ?? "",
      earlyWithdrawalPenaltyValue: plan.earlyWithdrawalPenaltyValue
        ? decimalToNumber(plan.earlyWithdrawalPenaltyValue).toFixed(2)
        : "",
      maxPenaltyAmount: plan.maxPenaltyAmount
        ? decimalToNumber(plan.maxPenaltyAmount).toFixed(2)
        : "",
      expectedReturnMin: plan.expectedReturnMin
        ? decimalToNumber(plan.expectedReturnMin).toFixed(2)
        : "",
      expectedReturnMax: plan.expectedReturnMax
        ? decimalToNumber(plan.expectedReturnMax).toFixed(2)
        : "",
      isLocked: plan.isLocked,
      allowWithdrawal: plan.allowWithdrawal,
      currency: plan.currency,
      seoTitle: plan.seoTitle ?? "",
      seoDescription: plan.seoDescription ?? "",
      seoImageFileId: plan.seoImageFileId ?? "",
      sortOrder: String(plan.sortOrder),
      durationDays: String(plan.durationDays),
      isActive: plan.isActive,
      tiers: (["CORE", "ADVANCED", "ELITE"] as const).map((level) => {
        const tier = plan.tiers.find((item) => item.level === level);

        return {
          level,
          minAmount: tier ? Number(tier.minAmount).toFixed(2) : "",
          maxAmount: tier ? Number(tier.maxAmount).toFixed(2) : "",
          fixedRoiPercent: tier?.fixedRoiPercent
            ? Number(tier.fixedRoiPercent).toFixed(2)
            : "",
          projectedRoiMin: tier?.projectedRoiMin
            ? Number(tier.projectedRoiMin).toFixed(2)
            : "",
          projectedRoiMax: tier?.projectedRoiMax
            ? Number(tier.projectedRoiMax).toFixed(2)
            : "",
          isActive: tier?.isActive ?? false,
        };
      }),
    },
    investmentOptions: planData.investmentOptions,
  };
}
