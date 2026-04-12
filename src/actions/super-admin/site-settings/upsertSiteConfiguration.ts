"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";
import { SITE_CONFIGURATION_ID } from "@/lib/site/siteConfiguration";
import {
  normalizeSiteConfigurationValues,
  siteConfigurationSchema,
} from "@/lib/zodValidations/siteConfiguration";
import type { SiteSettingsFormActionState } from "./siteSettingsForm.state";

function createErrorState(
  message: string,
  fieldErrors?: SiteSettingsFormActionState["fieldErrors"],
): SiteSettingsFormActionState {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

function getParsedKeywords(formData: FormData) {
  const raw = String(formData.get("keywords") ?? "[]");

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getFormData(formData: FormData) {
  return {
    siteName: String(formData.get("siteName") ?? ""),
    siteDescription: String(formData.get("siteDescription") ?? ""),
    siteTagline: String(formData.get("siteTagline") ?? ""),
    supportEmail: String(formData.get("supportEmail") ?? ""),
    supportPhone: String(formData.get("supportPhone") ?? ""),
    locale: String(formData.get("locale") ?? ""),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    keywords: getParsedKeywords(formData),
    defaultTwitterHandle: String(formData.get("defaultTwitterHandle") ?? ""),
    facebookUrl: String(formData.get("facebookUrl") ?? ""),
    instagramUrl: String(formData.get("instagramUrl") ?? ""),
    siteLogoFileAssetId: String(formData.get("siteLogoFileAssetId") ?? ""),
    defaultOgImageFileAssetId: String(
      formData.get("defaultOgImageFileAssetId") ?? "",
    ),
  };
}

async function validateFileAssetId(
  fileAssetId: string | null,
  field: "siteLogoFileAssetId" | "defaultOgImageFileAssetId",
) {
  if (!fileAssetId) {
    return null;
  }

  const asset = await prisma.fileAsset.findUnique({
    where: { id: fileAssetId },
    select: { id: true },
  });

  if (!asset) {
    return {
      field,
      message: "Select a valid file asset.",
    } as const;
  }

  return null;
}

export async function upsertSiteConfiguration(
  _prevState: SiteSettingsFormActionState,
  formData: FormData,
): Promise<SiteSettingsFormActionState> {
  const { userId } = await requireSuperAdminAccess();
  const parsed = siteConfigurationSchema.safeParse(getFormData(formData));

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;

    return createErrorState("Please review the highlighted site settings.", {
      siteName: flattened.siteName?.[0],
      siteDescription: flattened.siteDescription?.[0],
      siteTagline: flattened.siteTagline?.[0],
      supportEmail: flattened.supportEmail?.[0],
      supportPhone: flattened.supportPhone?.[0],
      locale: flattened.locale?.[0],
      seoTitle: flattened.seoTitle?.[0],
      seoDescription: flattened.seoDescription?.[0],
      keywords: flattened.keywords?.[0],
      defaultTwitterHandle: flattened.defaultTwitterHandle?.[0],
      facebookUrl: flattened.facebookUrl?.[0],
      instagramUrl: flattened.instagramUrl?.[0],
      siteLogoFileAssetId: flattened.siteLogoFileAssetId?.[0],
      defaultOgImageFileAssetId: flattened.defaultOgImageFileAssetId?.[0],
    });
  }

  const values = normalizeSiteConfigurationValues(parsed.data);
  const [existingConfig, logoValidation, ogValidation] = await Promise.all([
    prisma.siteConfiguration.findUnique({
      where: { id: SITE_CONFIGURATION_ID },
      select: {
        id: true,
      },
    }),
    validateFileAssetId(values.siteLogoFileAssetId, "siteLogoFileAssetId"),
    validateFileAssetId(
      values.defaultOgImageFileAssetId,
      "defaultOgImageFileAssetId",
    ),
  ]);

  if (logoValidation) {
    return createErrorState("The selected site logo could not be found.", {
      [logoValidation.field]: logoValidation.message,
    });
  }

  if (ogValidation) {
    return createErrorState("The selected OG image could not be found.", {
      [ogValidation.field]: ogValidation.message,
    });
  }

  const data = {
    siteName: values.siteName,
    siteDescription: values.siteDescription,
    siteTagline: values.siteTagline,
    supportEmail: values.supportEmail,
    supportPhone: values.supportPhone,
    locale: values.locale,
    seoTitle: values.seoTitle,
    seoDescription: values.seoDescription,
    keywords: values.keywords,
    defaultTwitterHandle: values.defaultTwitterHandle,
    facebookUrl: values.facebookUrl,
    instagramUrl: values.instagramUrl,
    siteLogoFileAssetId: values.siteLogoFileAssetId,
    defaultOgImageFileAssetId: values.defaultOgImageFileAssetId,
  };

  const savedConfig = await prisma.siteConfiguration.upsert({
    where: { id: SITE_CONFIGURATION_ID },
    create: {
      id: SITE_CONFIGURATION_ID,
      ...data,
    },
    update: data,
    select: { id: true },
  });

  await logAuditEvent({
    actorUserId: userId,
    action: existingConfig
      ? "site-configuration.updated"
      : "site-configuration.created",
    entityType: "SiteConfiguration",
    entityId: savedConfig.id,
    description: existingConfig
      ? "Updated site configuration."
      : "Created site configuration.",
    metadata: {
      siteName: values.siteName,
      locale: values.locale,
      keywords: values.keywords,
      hasSiteLogo: Boolean(values.siteLogoFileAssetId),
      hasDefaultOgImage: Boolean(values.defaultOgImageFileAssetId),
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/account/dashboard/super-admin/settings");

  return {
    status: "success",
    message: "Site settings saved successfully.",
  };
}
