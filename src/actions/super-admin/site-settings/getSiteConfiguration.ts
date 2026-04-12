import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { prisma } from "@/lib/prisma";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

export type SiteSettingsAssetOption = {
  id: string;
  label: string;
  url: string;
};

export type SiteSettingsFormValues = {
  siteName: string;
  siteDescription: string;
  siteTagline: string;
  supportEmail: string;
  supportPhone: string;
  locale: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  defaultTwitterHandle: string;
  facebookUrl: string;
  instagramUrl: string;
  siteLogoFileAssetId: string;
  defaultOgImageFileAssetId: string;
};

export type SiteSettingsData = {
  configId: string | null;
  values: SiteSettingsFormValues;
  fileAssetOptions: SiteSettingsAssetOption[];
  previews: {
    siteLogo: SiteSettingsAssetOption | null;
    defaultOgImage: SiteSettingsAssetOption | null;
  };
};

export async function getSiteConfiguration(): Promise<SiteSettingsData> {
  await requireSuperAdminAccess();

  const [config, fileAssets] = await Promise.all([
    getSiteConfigurationCached(),
    prisma.fileAsset.findMany({
      where: {
        url: {
          not: null,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 80,
      select: {
        id: true,
        fileName: true,
        originalName: true,
        url: true,
      },
    }),
  ]);

  const fileAssetOptions = fileAssets
    .filter((asset): asset is typeof asset & { url: string } => Boolean(asset.url))
    .map((asset) => ({
      id: asset.id,
      label: asset.originalName?.trim() || asset.fileName,
      url: asset.url,
    }));

  return {
    configId: config?.id ?? null,
    values: {
      siteName: config?.siteName ?? "",
      siteDescription: config?.siteDescription ?? "",
      siteTagline: config?.siteTagline ?? "",
      supportEmail: config?.supportEmail ?? "",
      supportPhone: config?.supportPhone ?? "",
      locale: config?.locale ?? "en_US",
      seoTitle: config?.seoTitle ?? "",
      seoDescription: config?.seoDescription ?? "",
      keywords: config?.keywords ?? [],
      defaultTwitterHandle: config?.defaultTwitterHandle ?? "",
      facebookUrl: config?.facebookUrl ?? "",
      instagramUrl: config?.instagramUrl ?? "",
      siteLogoFileAssetId: config?.siteLogoFileAssetId ?? "",
      defaultOgImageFileAssetId: config?.defaultOgImageFileAssetId ?? "",
    },
    fileAssetOptions,
    previews: {
      siteLogo:
        config?.siteLogoFileAsset?.id && config.siteLogoFileAsset.url
          ? {
              id: config.siteLogoFileAsset.id,
              label: "Current site logo",
              url: config.siteLogoFileAsset.url,
            }
          : null,
      defaultOgImage:
        config?.defaultOgImageFileAsset?.id && config.defaultOgImageFileAsset.url
          ? {
              id: config.defaultOgImageFileAsset.id,
              label: "Current OG image",
              url: config.defaultOgImageFileAsset.url,
            }
          : null,
    },
  };
}
