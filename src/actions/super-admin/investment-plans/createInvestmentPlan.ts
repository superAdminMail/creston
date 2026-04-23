"use server";

import { Prisma } from "@/generated/prisma";

import { logAuditEvent } from "@/lib/audit/logAuditEvent";
import {
  createErrorFormState,
  createValidationErrorState,
  getFriendlyServerError,
} from "@/lib/forms/actionState";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slugs/generateUniqueSlug";
import {
  investmentPlanFormSchema,
  normalizeInvestmentPlanFormValues,
} from "@/lib/zodValidations/investmentPlan";
import type { InvestmentPlanFormActionState } from "./investmentPlanForm.state";

function createErrorState(
  message: string,
  fieldErrors?: InvestmentPlanFormActionState["fieldErrors"],
): InvestmentPlanFormActionState {
  return createErrorFormState(message, fieldErrors);
}

function getParsedTiers(formData: FormData) {
  const value = String(formData.get("tiers") ?? "[]");

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getFormData(formData: FormData) {
  return {
    investmentId: String(formData.get("investmentId") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    period: String(formData.get("period") ?? ""),
    investmentModel: String(formData.get("investmentModel") ?? ""),
    penaltyPeriodDays: String(formData.get("penaltyPeriodDays") ?? ""),
    penaltyType: String(formData.get("penaltyType") ?? ""),
    earlyWithdrawalPenaltyValue: String(
      formData.get("earlyWithdrawalPenaltyValue") ?? "",
    ),
    maxPenaltyAmount: String(formData.get("maxPenaltyAmount") ?? ""),
    expectedReturnMin: String(formData.get("expectedReturnMin") ?? ""),
    expectedReturnMax: String(formData.get("expectedReturnMax") ?? ""),
    isLocked: String(formData.get("isLocked") ?? "false"),
    allowWithdrawal: String(formData.get("allowWithdrawal") ?? "true"),
    currency: String(formData.get("currency") ?? ""),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    seoImageFileId: String(formData.get("seoImageFileId") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? ""),
    durationDays: String(formData.get("durationDays") ?? ""),
    tiers: getParsedTiers(formData),
    isActive: String(formData.get("isActive") ?? "false"),
  };
}

export async function createInvestmentPlan(
  _prevState: InvestmentPlanFormActionState,
  formData: FormData,
): Promise<InvestmentPlanFormActionState> {
  try {
    const { userId } = await requireSuperAdminAccess();
    const parsed = investmentPlanFormSchema.safeParse(getFormData(formData));

    if (!parsed.success) {
      return createValidationErrorState(
        parsed.error.flatten().fieldErrors,
        "Please review the highlighted investment plan fields.",
      );
    }

    const values = normalizeInvestmentPlanFormValues(parsed.data);

    if (!values.normalizedSlug) {
      return createErrorState(
        "Enter a valid name or slug for this investment plan.",
        {
          slug: ["Enter a valid slug or plan name."],
        },
      );
    }

    const investment = await prisma.investment.findUnique({
      where: { id: values.investmentId },
      select: { id: true, name: true, symbol: true },
    });

    if (!investment) {
      return createErrorState("Select a valid investment for this plan.", {
        investmentId: ["Select a valid parent investment."],
      });
    }

    if (values.seoImageFileId) {
      const seoImage = await prisma.fileAsset.findUnique({
        where: { id: values.seoImageFileId },
        select: { id: true },
      });

      if (!seoImage) {
        return createErrorState("Select a valid SEO image file asset.", {
          seoImageFileId: ["Select a valid file asset id."],
        });
      }
    }

    const slug = await generateUniqueSlug({
      value: values.slugSource,
      model: "investmentPlan",
    });

    const plan = await prisma.investmentPlan.create({
        data: {
          investmentId: values.investmentId,
          name: values.name,
          slug,
          description: values.description,
          penaltyPeriodDays: values.penaltyPeriodDays,
          penaltyType: values.penaltyType,
          earlyWithdrawalPenaltyValue: values.earlyWithdrawalPenaltyValue
            ? new Prisma.Decimal(values.earlyWithdrawalPenaltyValue.toFixed(2))
            : null,
          maxPenaltyAmount: values.maxPenaltyAmount
            ? new Prisma.Decimal(values.maxPenaltyAmount.toFixed(2))
            : null,
          investmentModel: values.investmentModel,
          expectedReturnMin: values.expectedReturnMin
            ? new Prisma.Decimal(values.expectedReturnMin.toFixed(2))
            : null,
          expectedReturnMax: values.expectedReturnMax
            ? new Prisma.Decimal(values.expectedReturnMax.toFixed(2))
            : null,
          isLocked: values.isLocked,
          allowWithdrawal: values.allowWithdrawal,
          period: values.period,
          currency: values.currency,
          seoTitle: values.seoTitle,
          seoDescription: values.seoDescription,
          seoImageFileId: values.seoImageFileId,
          sortOrder: values.sortOrder,
          durationDays: values.durationDays,
          isActive: values.isActive,
          tiers: {
            create: values.tiers.map((tier) => ({
              level: tier.level,
              minAmount: new Prisma.Decimal(tier.minAmount.toFixed(2)),
              maxAmount: new Prisma.Decimal(tier.maxAmount.toFixed(2)),
              fixedRoiPercent:
                tier.fixedRoiPercent === null
                  ? null
                  : new Prisma.Decimal(tier.fixedRoiPercent.toFixed(2)),
              projectedRoiMin:
                tier.projectedRoiMin === null
                  ? null
                  : new Prisma.Decimal(tier.projectedRoiMin.toFixed(2)),
              projectedRoiMax:
                tier.projectedRoiMax === null
                  ? null
                  : new Prisma.Decimal(tier.projectedRoiMax.toFixed(2)),
              isActive: tier.isActive,
            })),
          },
        },
      select: {
        id: true,
      },
    });

    await logAuditEvent({
      actorUserId: userId,
      action: "investment-plan.created",
      entityType: "InvestmentPlan",
      entityId: plan.id,
      description: `Created investment plan ${values.name}.`,
      metadata: {
        investmentId: values.investmentId,
        investmentName: investment.name,
        name: values.name,
        slug,
        description: values.description,
        penaltyPeriodDays: values.penaltyPeriodDays,
        penaltyType: values.penaltyType,
        earlyWithdrawalPenaltyValue: values.earlyWithdrawalPenaltyValue,
        maxPenaltyAmount: values.maxPenaltyAmount,
        investmentModel: values.investmentModel,
        expectedReturnMin: values.expectedReturnMin,
        expectedReturnMax: values.expectedReturnMax,
        isLocked: values.isLocked,
        allowWithdrawal: values.allowWithdrawal,
        period: values.period,
        currency: values.currency,
        seoTitle: values.seoTitle,
        seoDescription: values.seoDescription,
        seoImageFileId: values.seoImageFileId,
        sortOrder: values.sortOrder,
        durationDays: values.durationDays,
        tiers: values.tiers,
        isActive: values.isActive,
      },
    });

    return {
      status: "success",
      message: "Investment plan created successfully.",
      redirectHref: `/account/dashboard/super-admin/investment-plans/${plan.id}`,
    };
  } catch (error) {
    return createErrorState(
      getFriendlyServerError(
        error,
        "Unable to create this investment plan right now.",
      ),
    );
  }
}
