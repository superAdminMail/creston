import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  });

const optionalUrlString = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || z.string().url().safeParse(value).success, {
    message: "Enter a valid URL.",
  })
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  });

const optionalEmailString = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || z.string().email().safeParse(value).success, {
    message: "Enter a valid email address.",
  })
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  });

export const siteConfigurationSchema = z.object({
  siteName: z.string().trim().min(1, "Site name is required."),
  siteDescription: optionalTrimmedString,
  siteTagline: optionalTrimmedString,
  siteAddress: optionalTrimmedString,
  siteCRN: optionalTrimmedString,
  siteFRN: optionalTrimmedString,
  supportEmail: optionalEmailString,
  supportPhone: optionalTrimmedString,
  supportPhoneSecondary: optionalTrimmedString,
  locale: optionalTrimmedString,
  seoTitle: optionalTrimmedString,
  seoDescription: optionalTrimmedString,
  keywords: z
    .array(z.string().trim().min(1, "Keyword cannot be empty."))
    .default([]),
  defaultTwitterHandle: optionalTrimmedString,
  facebookUrl: optionalUrlString,
  instagramUrl: optionalUrlString,
  siteLogoFileAssetId: optionalTrimmedString,
  defaultOgImageFileAssetId: optionalTrimmedString,
});

export type SiteConfigurationFormInput = z.infer<
  typeof siteConfigurationSchema
>;

export function normalizeSiteConfigurationValues(
  values: SiteConfigurationFormInput,
) {
  return {
    siteName: values.siteName.trim(),
    siteDescription: values.siteDescription,
    siteTagline: values.siteTagline,
    siteAddress: values.siteAddress,
    siteCRN: values.siteCRN,
    siteFRN: values.siteFRN,
    supportEmail: values.supportEmail,
    supportPhone: values.supportPhone,
    supportPhoneSecondary: values.supportPhoneSecondary,
    locale: values.locale ?? "en_US",
    seoTitle: values.seoTitle,
    seoDescription: values.seoDescription,
    keywords: Array.from(
      new Set(
        values.keywords
          .map((keyword) => keyword.trim())
          .filter(Boolean)
          .map((keyword) => keyword.toLowerCase()),
      ),
    ),
    defaultTwitterHandle: values.defaultTwitterHandle,
    facebookUrl: values.facebookUrl,
    instagramUrl: values.instagramUrl,
    siteLogoFileAssetId: values.siteLogoFileAssetId,
    defaultOgImageFileAssetId: values.defaultOgImageFileAssetId,
  };
}
