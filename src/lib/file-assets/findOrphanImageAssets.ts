import type {
  FileAssetType,
  FileAssetVisibility,
  FileStorageProvider,
  Prisma,
} from "@/generated/prisma";

import { prisma } from "@/lib/prisma";

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "avif",
  "bmp",
  "svg",
  "tif",
  "tiff",
  "ico",
  "heic",
  "heif",
]);

const PROTECTED_FILE_ASSET_TYPES = new Set<FileAssetType>([
  "DOCUMENT",
  "KYC_DOCUMENT",
  "REPORT",
]);

const IMAGE_LIKE_TYPES = new Set<FileAssetType>(["AVATAR", "OTHER"]);

export type FileAssetReferenceSummary = {
  usersAsProfileAvatar: number;
  investorProfilesAsAvatar: number;
  investmentIcons: number;
  siteLogo: number;
  siteConfigurationDefaultOgImages: number;
  investmentPlanSeoImages: number;
  testimonies: number;
  management: number;
  investmentOrderPayments: number;
  savingsTransactionPayments: number;
  total: number;
};

export type OrphanImageCleanupFilters = {
  olderThanDays?: number;
  limit?: number;
  provider?: FileStorageProvider | string | null;
  type?: FileAssetType | string | null;
};

export type OrphanImageAssetPreview = {
  id: string;
  originalName: string | null;
  fileName: string;
  mimeType: string | null;
  extension: string | null;
  type: FileAssetType;
  visibility: FileAssetVisibility;
  storageProvider: FileStorageProvider;
  storageKey: string;
  url: string | null;
  sizeBytes: number | null;
  createdAt: string;
  reason: "unreferenced_image_asset";
};

export type OrphanImageCleanupPreview = {
  olderThanDays: number;
  limit: number;
  totalFoundInBatch: number;
  estimatedSizeBytes: number;
  oldestCreatedAt: string | null;
  providerBreakdown: Array<{
    provider: FileStorageProvider;
    count: number;
    sizeBytes: number;
  }>;
  assets: OrphanImageAssetPreview[];
};

function clampOlderThanDays(value?: number) {
  if (!Number.isFinite(value)) return 7;

  return Math.max(7, Math.floor(value ?? 7));
}

function clampLimit(value?: number) {
  if (!Number.isFinite(value)) return 50;

  return Math.min(200, Math.max(1, Math.floor(value ?? 50)));
}

function normalizeProvider(
  value?: FileStorageProvider | string | null,
): FileStorageProvider | null {
  if (!value) return null;

  const normalized = value.toString().toUpperCase();
  const providers = new Set<FileStorageProvider>([
    "UPLOADTHING",
    "S3",
    "CLOUDINARY",
    "R2",
    "LOCAL",
  ]);

  return providers.has(normalized as FileStorageProvider)
    ? (normalized as FileStorageProvider)
    : null;
}

function normalizeType(value?: FileAssetType | string | null): FileAssetType | null {
  if (!value) return null;

  const normalized = value.toString().toUpperCase();
  const validTypes = new Set<FileAssetType>([
    "AVATAR",
    "DOCUMENT",
    "KYC_DOCUMENT",
    "REPORT",
    "OTHER",
  ]);

  return validTypes.has(normalized as FileAssetType)
    ? (normalized as FileAssetType)
    : null;
}

function isImageLikeAsset(input: {
  mimeType: string | null;
  extension: string | null;
  type: FileAssetType;
}) {
  if (PROTECTED_FILE_ASSET_TYPES.has(input.type)) {
    return false;
  }

  if (input.mimeType?.toLowerCase().startsWith("image/")) {
    return true;
  }

  if (!input.mimeType && input.extension) {
    const normalizedExtension = input.extension.toLowerCase().replace(/^\./, "");
    if (IMAGE_EXTENSIONS.has(normalizedExtension)) {
      return true;
    }
  }

  return IMAGE_LIKE_TYPES.has(input.type);
}

function buildImageOrphanWhere(
  filters: Required<Pick<OrphanImageCleanupFilters, "olderThanDays" | "limit">> & {
    provider: FileStorageProvider | null;
    type: FileAssetType | null;
    fileAssetId?: string;
  },
): Prisma.FileAssetWhereInput {
  const cutoffDate = new Date(
    Date.now() - filters.olderThanDays * 24 * 60 * 60 * 1000,
  );

  const where: Prisma.FileAssetWhereInput = {
    createdAt: {
      lt: cutoffDate,
    },
    NOT: [
      {
        type: {
          in: Array.from(PROTECTED_FILE_ASSET_TYPES),
        },
      },
    ],
    OR: [
      {
        mimeType: {
          startsWith: "image/",
        },
      },
      {
        AND: [
          {
            mimeType: null,
          },
          {
            extension: {
              in: Array.from(IMAGE_EXTENSIONS),
            },
          },
        ],
      },
      {
        type: {
          in: Array.from(IMAGE_LIKE_TYPES),
        },
      },
    ],
    investmentIcons: {
      none: {},
    },
    usersAsProfileAvatar: {
      none: {},
    },
    investorProfilesAsAvatar: {
      none: {},
    },
    siteConfigurationDefaultOgImages: {
      none: {},
    },
    siteLogo: {
      is: null,
    },
    investmentPlanSeoImages: {
      none: {},
    },
    testimonies: {
      none: {},
    },
    management: {
      none: {},
    },
    investmentOrderPayments: {
      none: {},
    },
    savingsTransactionPayments: {
      none: {},
    },
  };

  if (filters.provider) {
    where.storageProvider = filters.provider;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.fileAssetId) {
    where.id = filters.fileAssetId;
  }

  return where;
}

async function countFileAssetReferences(fileAssetId: string) {
  const [
    usersAsProfileAvatar,
    investorProfilesAsAvatar,
    investmentIcons,
    siteLogo,
    siteConfigurationDefaultOgImages,
    investmentPlanSeoImages,
    testimonies,
    management,
    investmentOrderPayments,
    savingsTransactionPayments,
  ] = await Promise.all([
    prisma.user.count({
      where: { profileAvatarFileAssetId: fileAssetId },
    }),
    prisma.investorProfile.count({
      where: { avatarFileId: fileAssetId },
    }),
    prisma.investment.count({
      where: { iconFileAssetId: fileAssetId },
    }),
    prisma.siteConfiguration.count({
      where: { siteLogoFileAssetId: fileAssetId },
    }),
    prisma.siteConfiguration.count({
      where: { defaultOgImageFileAssetId: fileAssetId },
    }),
    prisma.investmentPlan.count({
      where: { seoImageFileId: fileAssetId },
    }),
    prisma.testimony.count({
      where: { avatarFileId: fileAssetId },
    }),
    prisma.management.count({
      where: { photoFileId: fileAssetId },
    }),
    prisma.investmentOrderPayment.count({
      where: { receiptFileId: fileAssetId },
    }),
    prisma.savingsTransactionPayment.count({
      where: { receiptFileId: fileAssetId },
    }),
  ]);

  const total =
    usersAsProfileAvatar +
    investorProfilesAsAvatar +
    investmentIcons +
    siteLogo +
    siteConfigurationDefaultOgImages +
    investmentPlanSeoImages +
    testimonies +
    management +
    investmentOrderPayments +
    savingsTransactionPayments;

  return {
    usersAsProfileAvatar,
    investorProfilesAsAvatar,
    investmentIcons,
    siteLogo,
    siteConfigurationDefaultOgImages,
    investmentPlanSeoImages,
    testimonies,
    management,
    investmentOrderPayments,
    savingsTransactionPayments,
    total,
  } satisfies FileAssetReferenceSummary;
}

export async function getFileAssetReferenceSummary(
  fileAssetId: string,
): Promise<FileAssetReferenceSummary> {
  return countFileAssetReferences(fileAssetId);
}

export async function findOrphanImageAssets(filters: OrphanImageCleanupFilters) {
  const olderThanDays = clampOlderThanDays(filters.olderThanDays);
  const limit = clampLimit(filters.limit);
  const provider = normalizeProvider(filters.provider);
  const type = normalizeType(filters.type);

  const where = buildImageOrphanWhere({
    olderThanDays,
    limit,
    provider,
    type,
  });

  const assets = await prisma.fileAsset.findMany({
    where,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: limit,
    select: {
      id: true,
      originalName: true,
      fileName: true,
      mimeType: true,
      extension: true,
      type: true,
      visibility: true,
      storageProvider: true,
      storageKey: true,
      url: true,
      sizeBytes: true,
      createdAt: true,
    },
  });

  const providerBreakdownMap = new Map<
    FileStorageProvider,
    { count: number; sizeBytes: number }
  >();

  let estimatedSizeBytes = 0;

  const previewAssets = assets.map((asset) => {
    const sizeBytes =
      asset.sizeBytes === null ? null : Number(asset.sizeBytes.toString());

    if (sizeBytes !== null && Number.isFinite(sizeBytes)) {
      estimatedSizeBytes += sizeBytes;
    }

    const existing = providerBreakdownMap.get(asset.storageProvider) ?? {
      count: 0,
      sizeBytes: 0,
    };

    providerBreakdownMap.set(asset.storageProvider, {
      count: existing.count + 1,
      sizeBytes: existing.sizeBytes + (sizeBytes ?? 0),
    });

    return {
      id: asset.id,
      originalName: asset.originalName,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      extension: asset.extension,
      type: asset.type,
      visibility: asset.visibility,
      storageProvider: asset.storageProvider,
      storageKey: asset.storageKey,
      url: asset.url,
      sizeBytes,
      createdAt: asset.createdAt.toISOString(),
      reason: "unreferenced_image_asset" as const,
    };
  });

  const oldestCreatedAt = previewAssets.at(0)?.createdAt ?? null;

  return {
    olderThanDays,
    limit,
    totalFoundInBatch: previewAssets.length,
    estimatedSizeBytes,
    oldestCreatedAt,
    providerBreakdown: Array.from(providerBreakdownMap.entries()).map(
      ([providerKey, value]) => ({
        provider: providerKey,
        count: value.count,
        sizeBytes: value.sizeBytes,
      }),
    ),
    assets: previewAssets,
  };
}

export async function findStillOrphanImageAssetById(
  fileAssetId: string,
  filters?: Pick<OrphanImageCleanupFilters, "olderThanDays" | "provider" | "type">,
) {
  const where = buildImageOrphanWhere({
    olderThanDays: clampOlderThanDays(filters?.olderThanDays),
    limit: 1,
    provider: normalizeProvider(filters?.provider),
    type: normalizeType(filters?.type),
    fileAssetId,
  });

  return prisma.fileAsset.findFirst({
    where,
    select: {
      id: true,
      storageKey: true,
      storageProvider: true,
    },
  });
}

export function isCleanupCandidateImageAsset(input: {
  mimeType: string | null;
  extension: string | null;
  type: FileAssetType;
}) {
  return isImageLikeAsset(input);
}
