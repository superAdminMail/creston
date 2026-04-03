"use server";

import { Prisma } from "@/generated/prisma";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slugs/generateUniqueSlug";

import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";
import type { InvestmentPlanFormActionState } from "./investmentPlanForm.state";
import {
  investmentPlanFormSchema,
  normalizeInvestmentPlanFormValues,
} from "@/lib/zodValidations/investmentPlan";

function createErrorState(
  message: string,
  fieldErrors?: InvestmentPlanFormActionState["fieldErrors"],
): InvestmentPlanFormActionState {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

function getFormData(formData: FormData) {
  return {
    investmentId: String(formData.get("investmentId") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    period: String(formData.get("period") ?? ""),
    minAmount: String(formData.get("minAmount") ?? ""),
    maxAmount: String(formData.get("maxAmount") ?? ""),
    currency: String(formData.get("currency") ?? ""),
    isActive: String(formData.get("isActive") ?? "false"),
  };
}

export async function updateInvestmentPlan(
  investmentPlanId: string,
  _prevState: InvestmentPlanFormActionState,
  formData: FormData,
): Promise<InvestmentPlanFormActionState> {
  const { userId } = await requireSuperAdminAccess();
  const parsed = investmentPlanFormSchema.safeParse(getFormData(formData));

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;

    return createErrorState(
      "Please review the highlighted investment plan fields.",
      {
        investmentId: flattened.investmentId?.[0],
        name: flattened.name?.[0],
        slug: flattened.slug?.[0],
        description: flattened.description?.[0],
        category: flattened.category?.[0],
        period: flattened.period?.[0],
        minAmount: flattened.minAmount?.[0],
        maxAmount: flattened.maxAmount?.[0],
        currency: flattened.currency?.[0],
        isActive: flattened.isActive?.[0],
      },
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
      category: true,
      period: true,
      minAmount: true,
      maxAmount: true,
      currency: true,
      isActive: true,
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
        slug: "Enter a valid slug or plan name.",
      },
    );
  }

  const investment = await prisma.investment.findUnique({
    where: { id: values.investmentId },
    select: { id: true, name: true },
  });

  if (!investment) {
    return createErrorState("Select a valid investment for this plan.", {
      investmentId: "Select a valid parent investment.",
    });
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
      category: values.category,
      period: values.period,
      minAmount: new Prisma.Decimal(values.minAmount.toFixed(2)),
      maxAmount: new Prisma.Decimal(values.maxAmount.toFixed(2)),
      currency: values.currency,
      isActive: values.isActive,
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
        category: values.category,
        period: values.period,
        minAmount: values.minAmount,
        maxAmount: values.maxAmount,
        currency: values.currency,
        isActive: values.isActive,
      },
    },
  });

  redirect(
    `/account/dashboard/super-admin/investment-plans/${investmentPlanId}?toast=updated`,
  );
}
