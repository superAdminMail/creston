import { z } from "zod";

export const siteConfigurationSchema = z.object({
  siteName: z.string().min(2, "Site name is required"),
  siteDescription: z.string().max(300).optional(),
  siteTagline: z.string().max(120).optional(),

  supportEmail: z.string().email().optional().or(z.literal("")),

  locale: z.string().default("en_US"),
  keywords: z.array(z.string()).optional(),

  defaultTwitterHandle: z.string().optional(),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),

  defaultOgImageFileAssetId: z.string().optional(),
});

export type SiteConfigurationInput = z.infer<typeof siteConfigurationSchema>;
