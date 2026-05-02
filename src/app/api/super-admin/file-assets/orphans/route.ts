import { NextResponse } from "next/server";

import { FileStorageProvider } from "@/generated/prisma";
import { logAuditEvent } from "@/lib/audit/logAuditEvent";
import {
  findOrphanImageAssets,
  findStillOrphanImageAssetById,
} from "@/lib/file-assets/findOrphanImageAssets";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { deleteFileAssetFromStorage } from "@/lib/storage/deleteFileAssetFromStorage";

export const dynamic = "force-dynamic";

type CleanupResultStatus = "deleted" | "skipped" | "failed";

type CleanupResultItem = {
  assetId: string;
  originalName: string | null;
  fileName: string;
  storageProvider: string;
  storageKey: string;
  status: CleanupResultStatus;
  reason: string;
  deletedFromStorage: boolean;
  deletedFromDatabase: boolean;
  storageResult: {
    ok: boolean;
    provider: string;
    storageKey: string;
    error?: string;
  } | null;
};

type SuperAdminSession = {
  userId: string;
};

async function requireSuperAdminApiAccess(): Promise<
  SuperAdminSession | NextResponse
> {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      role: true,
    },
  });

  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return {
    userId: sessionUser.id,
  };
}

function readStringParam(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toNumberOrUndefined(value: string | null) {
  if (!value) return undefined;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildDeleteResponse(results: CleanupResultItem[]) {
  const summary = results.reduce(
    (acc, item) => {
      acc.deletedFromStorage += item.deletedFromStorage ? 1 : 0;
      acc.deletedFromDatabase += item.deletedFromDatabase ? 1 : 0;
      acc.skipped += item.status === "skipped" ? 1 : 0;
      acc.failed += item.status === "failed" ? 1 : 0;

      return acc;
    },
    {
      deletedFromStorage: 0,
      deletedFromDatabase: 0,
      skipped: 0,
      failed: 0,
    },
  );

  return {
    scanned: results.length,
    deletedFromStorage: summary.deletedFromStorage,
    deletedFromDatabase: summary.deletedFromDatabase,
    skipped: summary.skipped,
    failed: summary.failed,
    results,
  };
}

export async function GET(request: Request) {
  const access = await requireSuperAdminApiAccess();

  if (access instanceof NextResponse) {
    return access;
  }

  const url = new URL(request.url);
  const olderThanDays = toNumberOrUndefined(url.searchParams.get("olderThanDays"));
  const limit = toNumberOrUndefined(url.searchParams.get("limit"));
  const provider = readStringParam(url.searchParams.get("provider"));
  const type = readStringParam(url.searchParams.get("type"));

  const preview = await findOrphanImageAssets({
    olderThanDays,
    limit,
    provider,
    type,
  });

  await logAuditEvent({
    actorUserId: access.userId,
    action: "ORPHAN_IMAGE_CLEANUP_DRY_RUN",
    entityType: "FileAsset",
    description: `Dry-run orphan cleanup preview for ${preview.totalFoundInBatch} image asset(s).`,
    metadata: {
      olderThanDays: preview.olderThanDays,
      limit: preview.limit,
      provider,
      type,
      totalFoundInBatch: preview.totalFoundInBatch,
      estimatedSizeBytes: preview.estimatedSizeBytes,
      oldestCreatedAt: preview.oldestCreatedAt,
      providerBreakdown: preview.providerBreakdown,
      assetIds: preview.assets.map((asset) => asset.id),
    },
  });

  return NextResponse.json(preview);
}

export async function DELETE(request: Request) {
  const access = await requireSuperAdminApiAccess();

  if (access instanceof NextResponse) {
    return access;
  }

  const body = (await request.json().catch(() => null)) as
    | {
        confirm?: string;
        olderThanDays?: number;
        limit?: number;
        provider?: string | null;
        type?: string | null;
        deleteStorage?: boolean;
        forceDbDelete?: boolean;
      }
    | null;

  if (body?.confirm !== "DELETE_ORPHANED_IMAGES") {
    return NextResponse.json(
      { error: "Confirmation text is required." },
      { status: 400 },
    );
  }

  const deleteStorage = body.deleteStorage ?? true;
  const forceDbDelete = body.forceDbDelete ?? false;
  const olderThanDays = body.olderThanDays;
  const limit = body.limit;
  const provider = readStringParam(body.provider ?? null);
  const type = readStringParam(body.type ?? null);

  const preview = await findOrphanImageAssets({
    olderThanDays,
    limit,
    provider,
    type,
  });

  const results: CleanupResultItem[] = [];

  for (const asset of preview.assets) {
    const stillOrphan = await findStillOrphanImageAssetById(asset.id, {
      olderThanDays: preview.olderThanDays,
      provider,
      type,
    });

    if (!stillOrphan) {
      results.push({
        assetId: asset.id,
        originalName: asset.originalName,
        fileName: asset.fileName,
        storageProvider: asset.storageProvider,
        storageKey: asset.storageKey,
        status: "skipped",
        reason: "still_referenced",
        deletedFromStorage: false,
        deletedFromDatabase: false,
        storageResult: null,
      });

      continue;
    }

    let storageResult: CleanupResultItem["storageResult"] = null;
    let deletedFromStorage = false;
    let deletedFromDatabase = false;
    let status: CleanupResultStatus = "deleted";
    let reason = "orphan_removed";
    const isUploadThingProvider =
      stillOrphan.storageProvider === FileStorageProvider.UPLOADTHING;

    if (!isUploadThingProvider) {
      storageResult = {
        ok: false,
        provider: stillOrphan.storageProvider,
        storageKey: stillOrphan.storageKey,
        error: "unsupported_provider",
      };

      reason = "unsupported_provider";

      if (!forceDbDelete) {
        results.push({
          assetId: asset.id,
          originalName: asset.originalName,
          fileName: asset.fileName,
          storageProvider: asset.storageProvider,
          storageKey: asset.storageKey,
          status: "skipped",
          reason,
          deletedFromStorage: false,
          deletedFromDatabase: false,
          storageResult,
        });

        continue;
      }
    }

    if (deleteStorage && isUploadThingProvider) {
      storageResult = await deleteFileAssetFromStorage({
        storageProvider: stillOrphan.storageProvider,
        storageKey: stillOrphan.storageKey,
        url: asset.url ?? undefined,
      });

      deletedFromStorage = Boolean(storageResult.ok);

      if (!storageResult.ok) {
        reason = storageResult.error ?? "storage_delete_failed";

        if (!forceDbDelete) {
          status = "failed";
          results.push({
            assetId: asset.id,
            originalName: asset.originalName,
            fileName: asset.fileName,
            storageProvider: asset.storageProvider,
            storageKey: asset.storageKey,
            status,
            reason,
            deletedFromStorage,
            deletedFromDatabase,
            storageResult,
          });
          continue;
        }
      }
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.fileAsset.delete({
          where: { id: asset.id },
        });
      });

      deletedFromDatabase = true;
    } catch (error) {
      status = "failed";
      reason =
        error instanceof Error
          ? error.message
          : "Unable to delete the file asset record.";

      results.push({
        assetId: asset.id,
        originalName: asset.originalName,
        fileName: asset.fileName,
        storageProvider: asset.storageProvider,
        storageKey: asset.storageKey,
        status,
        reason,
        deletedFromStorage,
        deletedFromDatabase,
        storageResult,
      });
      continue;
    }

    if (deleteStorage && !deletedFromStorage && forceDbDelete) {
      reason = `${reason}; db_deleted_after_storage_failure`;
    }

    results.push({
      assetId: asset.id,
      originalName: asset.originalName,
      fileName: asset.fileName,
      storageProvider: asset.storageProvider,
      storageKey: asset.storageKey,
      status,
      reason,
      deletedFromStorage,
      deletedFromDatabase,
      storageResult,
    });
  }

  const response = buildDeleteResponse(results);

  await logAuditEvent({
    actorUserId: access.userId,
    action: "ORPHAN_IMAGE_CLEANUP_EXECUTED",
    entityType: "FileAsset",
    description: `Executed orphan image cleanup for ${response.scanned} asset(s).`,
    metadata: {
      olderThanDays: preview.olderThanDays,
      limit: preview.limit,
      provider,
      type,
      deleteStorage,
      forceDbDelete,
      scanned: response.scanned,
      deletedFromStorage: response.deletedFromStorage,
      deletedFromDatabase: response.deletedFromDatabase,
      skipped: response.skipped,
      failed: response.failed,
      deletedIds: results
        .filter((item) => item.deletedFromDatabase)
        .map((item) => item.assetId),
      skippedIds: results
        .filter((item) => item.status === "skipped")
        .map((item) => item.assetId),
      failedIds: results
        .filter((item) => item.status === "failed")
        .map((item) => item.assetId),
      storageResults: results.map((item) => ({
        assetId: item.assetId,
        storageProvider: item.storageProvider,
        storageKey: item.storageKey,
        deletedFromStorage: item.deletedFromStorage,
        deletedFromDatabase: item.deletedFromDatabase,
        status: item.status,
        reason: item.reason,
        storageResult: item.storageResult,
      })),
    },
  });

  return NextResponse.json(response);
}
