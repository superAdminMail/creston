import { prisma } from "@/lib/prisma";
import { SITE_CONFIGURATION_ID } from "@/lib/site/siteConfiguration";

export const siteConfigurationSelect = {
  id: true,
  siteName: true,
  siteDescription: true,
  siteTagline: true,
  supportEmail: true,
  supportPhone: true,
  locale: true,
  keywords: true,
  defaultTwitterHandle: true,
  facebookUrl: true,
  instagramUrl: true,
  siteLogoFileAssetId: true,
  defaultOgImageFileAssetId: true,
  siteLogoFileAsset: {
    select: {
      id: true,
      url: true,
      storageKey: true,
      fileName: true,
    },
  },
  defaultOgImageFileAsset: {
    select: {
      id: true,
      url: true,
      storageKey: true,
      fileName: true,
    },
  },
} as const;

export async function getSiteConfiguration() {
  return prisma.siteConfiguration.findUnique({
    where: { id: SITE_CONFIGURATION_ID },
    select: siteConfigurationSelect,
  });
}
