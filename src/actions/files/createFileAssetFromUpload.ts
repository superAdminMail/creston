"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

export async function createFileAssetFromUpload(file: {
  url: string;
  key: string;
  name?: string;
  size?: number;
  type?: string;
}) {
  const user = await getCurrentSessionUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const asset = await prisma.fileAsset.create({
    data: {
      fileName: file.name ?? file.key,
      originalName: file.name ?? file.key,
      mimeType: file.type,
      sizeBytes: file.size ? BigInt(file.size) : undefined,
      storageKey: file.key,
      url: file.url,
      storageProvider: "UPLOADTHING",
      type: "OTHER",
      visibility: "PUBLIC",
      uploadedById: user.id,
    },
  });

  return asset;
}
