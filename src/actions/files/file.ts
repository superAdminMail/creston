"use server";

import { revalidatePath } from "next/cache";

import { FileStorageProvider } from "@/generated/prisma";
import { getFileAssetReferenceSummary } from "@/lib/file-assets/findOrphanImageAssets";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { SITE_CONFIGURATION_ID } from "@/lib/site/siteConfiguration";
import { deleteFileAssetFromStorage } from "@/lib/storage/deleteFileAssetFromStorage";

type FileActionResult = {
  success?: true;
  message?: string;
  error?: string;
  fileAssetId?: string;
  deleted?: boolean;
  orphaned?: boolean;
};

async function requireAuthenticatedUser() {
  const user = await getCurrentSessionUser();

  if (!user) {
    return null;
  }

  return user;
}

async function deleteStorageObject(storageKey: string) {
  const result = await deleteFileAssetFromStorage({
    storageProvider: FileStorageProvider.UPLOADTHING,
    storageKey,
  });

  if (!result.ok) {
    throw new Error(result.error ?? "Unable to delete file");
  }
}

async function deleteFileAssetIfOrphaned(
  fileAssetId: string,
): Promise<FileActionResult> {
  const fileAsset = await prisma.fileAsset.findUnique({
    where: { id: fileAssetId },
    select: {
      id: true,
      storageKey: true,
      storageProvider: true,
    },
  });

  if (!fileAsset) {
    return { error: "File asset not found." };
  }

  const references = await getFileAssetReferenceSummary(fileAssetId);

  if (references.total > 0) {
    return {
      success: true,
      orphaned: false,
      deleted: false,
      fileAssetId,
      message: "File asset is still referenced and was left in the registry.",
    };
  }

  if (fileAsset.storageKey) {
    const storageDeletion = await deleteFileAssetFromStorage({
      storageProvider: fileAsset.storageProvider,
      storageKey: fileAsset.storageKey,
    });

    if (!storageDeletion.ok) {
      return {
        error:
          storageDeletion.error ??
          "Unable to delete the storage object for this file asset.",
      };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.fileAsset.delete({
      where: { id: fileAssetId },
    });
  });

  return {
    success: true,
    deleted: true,
    orphaned: true,
    fileAssetId,
    message: "File asset removed successfully.",
  };
}

// Delete an uncommitted uploaded file during preview cleanup before a FileAsset is created.
export async function deleteFileAction(
  keyToDelete: string,
): Promise<FileActionResult> {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return { error: "Unauthorized access" };
  }

  if (!keyToDelete) {
    return { error: "Missing file key" };
  }

  try {
    await deleteStorageObject(keyToDelete);
    return { success: true, message: "Preview file removed." };
  } catch (error) {
    console.error("Failed to delete preview file:", error);
    return { error: "Unable to delete file" };
  }
}

// Backward-compatible alias for deleting a temporary uploaded object by storage key.
export async function deleteUploadedFileAction(
  fileKey: string,
): Promise<FileActionResult> {
  return deleteFileAction(fileKey);
}

// Detach the current site logo from SiteConfiguration, then delete the registry file only if no relation still uses it.
export async function deleteLogoAction(
  fileKey: string,
): Promise<FileActionResult> {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return { error: "Unauthorized access" };
  }

  if (!fileKey) {
    return { error: "Missing file key" };
  }

  try {
    const fileAsset = await prisma.fileAsset.findUnique({
      where: { storageKey: fileKey },
      select: {
        id: true,
      },
    });

    const siteConfig = await prisma.siteConfiguration.findUnique({
      where: { id: SITE_CONFIGURATION_ID },
      select: {
        id: true,
        siteLogoFileAssetId: true,
      },
    });

    if (siteConfig?.siteLogoFileAssetId) {
      await prisma.siteConfiguration.update({
        where: { id: siteConfig.id },
        data: { siteLogoFileAssetId: null },
      });
    }

    if (!fileAsset?.id) {
      revalidatePath("/account/dashboard/super-admin/settings");
      return { success: true, message: "Logo detached successfully." };
    }

    const deletion = await deleteFileAssetIfOrphaned(fileAsset.id);

    revalidatePath("/account/dashboard/super-admin/settings");

    if (deletion.error) {
      return deletion;
    }

    return {
      ...deletion,
      message:
        deletion.deleted || deletion.orphaned
          ? "Logo removed successfully."
          : "Logo detached, but the file is still used elsewhere.",
    };
  } catch (error) {
    console.error("Failed to delete site logo:", error);
    return { error: "Unable to delete file" };
  }
}

// Delete a registry file asset only when nothing else in the schema still references it.
export async function deleteFileAssetAction(
  fileAssetId: string,
): Promise<FileActionResult> {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return { error: "Unauthorized access" };
  }

  if (!fileAssetId) {
    return { error: "Missing file asset id" };
  }

  try {
    return await deleteFileAssetIfOrphaned(fileAssetId);
  } catch (error) {
    console.error("Failed to delete file asset:", error);
    return { error: "Unable to delete file asset" };
  }
}

// Inspect whether a file asset is still attached anywhere before allowing destructive cleanup.
export async function getFileAssetUsageAction(fileAssetId: string): Promise<
  FileActionResult & {
    references?: Awaited<ReturnType<typeof getFileAssetReferenceSummary>>;
  }
> {
  const user = await requireAuthenticatedUser();

  if (!user) {
    return { error: "Unauthorized access" };
  }

  if (!fileAssetId) {
    return { error: "Missing file asset id" };
  }

  try {
    const fileAsset = await prisma.fileAsset.findUnique({
      where: { id: fileAssetId },
      select: { id: true },
    });

    if (!fileAsset) {
      return { error: "File asset not found." };
    }

    const references = await getFileAssetReferenceSummary(fileAssetId);

    return {
      success: true,
      fileAssetId,
      references,
      orphaned: references.total === 0,
      deleted: false,
    };
  } catch (error) {
    console.error("Failed to inspect file asset usage:", error);
    return { error: "Unable to inspect file asset usage" };
  }
}
