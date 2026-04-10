"use server";

import { Prisma } from "@/generated/prisma";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slugs/generateUniqueSlug";
import {
  investmentPlanFormSchema,
  normalizeInvestmentPlanFormValues,
} from "@/lib/zodValidations/investmentPlan";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";
import {
  createErrorFormState,
  createValidationErrorState,
} from "@/lib/forms/actionState";
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
    currency: String(formData.get("currency") ?? ""),
    tiers: getParsedTiers(formData),
    isActive: String(formData.get("isActive") ?? "false"),
  };
}

export async function createInvestmentPlan(
  _prevState: InvestmentPlanFormActionState,
  formData: FormData,
): Promise<InvestmentPlanFormActionState> {
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
    select: { id: true, name: true },
  });

  if (!investment) {
    return createErrorState("Select a valid investment for this plan.", {
      investmentId: ["Select a valid parent investment."],
    });
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
      period: values.period,
      currency: values.currency,
      isActive: values.isActive,
      tiers: {
        create: values.tiers.map((tier) => ({
          level: tier.level,
          minAmount: new Prisma.Decimal(tier.minAmount.toFixed(2)),
          maxAmount: new Prisma.Decimal(tier.maxAmount.toFixed(2)),
          roiPercent: new Prisma.Decimal(tier.roiPercent.toFixed(2)),
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
      period: values.period,
      currency: values.currency,
      tiers: values.tiers,
      isActive: values.isActive,
    },
  });

  redirect(
    `/account/dashboard/super-admin/investment-plans/${plan.id}?toast=created`,
  );
}
