"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slugs/generateUniqueSlug";
import {
  investmentFormSchema,
  normalizeInvestmentFormValues,
} from "@/lib/zodValidations/investment";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";
import {
  createErrorFormState,
  createValidationErrorState,
} from "@/lib/forms/actionState";
import type { InvestmentFormActionState } from "./investmentForm.state";

function createErrorState(
  message: string,
  fieldErrors?: InvestmentFormActionState["fieldErrors"],
): InvestmentFormActionState {
  return createErrorFormState(message, fieldErrors);
}

function getFormData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    type: String(formData.get("type") ?? ""),
    period: String(formData.get("period") ?? ""),
    status: String(formData.get("status") ?? ""),
    iconFileAssetId: String(formData.get("iconFileAssetId") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? ""),
    isActive: String(formData.get("isActive") ?? "false"),
  };
}

export async function updateInvestment(
  investmentId: string,
  _prevState: InvestmentFormActionState,
  formData: FormData,
): Promise<InvestmentFormActionState> {
  const { userId } = await requireSuperAdminAccess();
  const parsed = investmentFormSchema.safeParse(getFormData(formData));

  if (!parsed.success) {
    return createValidationErrorState(
      parsed.error.flatten().fieldErrors,
      "Please review the highlighted investment fields.",
    );
  }

  const existingInvestment = await prisma.investment.findUnique({
    where: { id: investmentId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      type: true,
      period: true,
      status: true,
      iconFileAssetId: true,
      sortOrder: true,
      isActive: true,
    },
  });

  if (!existingInvestment) {
    return createErrorState("This investment could not be found.");
  }

  const values = normalizeInvestmentFormValues(parsed.data);

  if (!values.normalizedSlug) {
    return createErrorState("Enter a valid name or slug for this investment.", {
      slug: ["Enter a valid slug or investment name."],
    });
  }

  if (values.iconFileAssetId) {
    const asset = await prisma.fileAsset.findUnique({
      where: { id: values.iconFileAssetId },
      select: { id: true },
    });

    if (!asset) {
      return createErrorState("The selected icon file could not be found.", {
        iconFileAssetId: ["Select a valid file asset."],
      });
    }
  }

  const slug = await generateUniqueSlug({
    value: values.slugSource,
    model: "investment",
    excludeId: investmentId,
  });

  await prisma.investment.update({
    where: { id: investmentId },
    data: {
      name: values.name,
      slug,
      description: values.description,
      type: values.type,
      status: values.status,
      iconFileAssetId: values.iconFileAssetId,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    },
  });

  await logAuditEvent({
    actorUserId: userId,
    action: "investment.updated",
    entityType: "Investment",
    entityId: investmentId,
    description: `Updated investment ${values.name}.`,
    metadata: {
      previous: existingInvestment,
      next: {
        name: values.name,
        slug,
        description: values.description,
        type: values.type,
        status: values.status,
        iconFileAssetId: values.iconFileAssetId,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
      },
    },
  });

  redirect(
    `/account/dashboard/super-admin/investments/${investmentId}?toast=updated`,
  );
}
