import { cache } from "react";

import { prisma } from "@/lib/prisma";

export const getSiteConfigurationCached = cache(async () => {
  return prisma.siteConfiguration.findFirst({
    select: {
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
        },
      },
      defaultOgImageFileAsset: {
        select: {
          id: true,
          url: true,
        },
      },
    },
  });
});
