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

export async function createInvestment(
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
  });

  const investment = await prisma.investment.create({
    data: {
      name: values.name,
      slug,
      description: values.description,
      type: values.type,
      period: values.period,
      status: values.status,
      iconFileAssetId: values.iconFileAssetId,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    },
    select: {
      id: true,
    },
  });

  await logAuditEvent({
    actorUserId: userId,
    action: "investment.created",
    entityType: "Investment",
    entityId: investment.id,
    description: `Created investment ${values.name}.`,
    metadata: {
      name: values.name,
      slug,
      type: values.type,
      period: values.period,
      status: values.status,
      isActive: values.isActive,
      sortOrder: values.sortOrder,
    },
  });

  redirect(
    `/account/dashboard/super-admin/investments/${investment.id}?toast=created`,
  );
}
