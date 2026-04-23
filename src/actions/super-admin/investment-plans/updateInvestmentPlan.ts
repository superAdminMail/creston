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

export async function updateInvestmentPlan(
  investmentPlanId: string,
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

    const existingPlan = await prisma.investmentPlan.findUnique({
      where: { id: investmentPlanId },
      select: {
        id: true,
        investmentId: true,
        name: true,
        slug: true,
        description: true,
        period: true,
        currency: true,
        penaltyPeriodDays: true,
        penaltyType: true,
        earlyWithdrawalPenaltyValue: true,
        maxPenaltyAmount: true,
        investmentModel: true,
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

    if (!existingPlan) {
      return createErrorState("This investment plan could not be found.");
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
      select: { id: true, name: true },
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
      excludeId: investmentPlanId,
    });

    await prisma.investmentPlan.update({
        where: { id: investmentPlanId },
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
            deleteMany: {},
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
    });

    await logAuditEvent({
      actorUserId: userId,
      action: "investment-plan.updated",
      entityType: "InvestmentPlan",
      entityId: investmentPlanId,
      description: `Updated investment plan ${values.name}.`,
      metadata: {
        previous: existingPlan,
        next: {
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
      },
    });

    return {
      status: "success",
      message: "Investment plan updated successfully.",
      redirectHref: `/account/dashboard/super-admin/investment-plans/${investmentPlanId}`,
    };
  } catch (error) {
    return createErrorState(
      getFriendlyServerError(
        error,
        "Unable to update this investment plan right now.",
      ),
    );
  }
}
