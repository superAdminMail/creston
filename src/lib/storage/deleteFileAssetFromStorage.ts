import { FileStorageProvider } from "@/generated/prisma";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export type DeleteFileAssetFromStorageResult = {
  ok: boolean;
  provider: string;
  storageKey: string;
  error?: string;
};

export async function deleteFileAssetFromStorage(input: {
  storageProvider: FileStorageProvider | string;
  storageKey: string;
  url?: string | null;
}): Promise<DeleteFileAssetFromStorageResult> {
  const provider = input.storageProvider.toString().toUpperCase();

  if (!input.storageKey) {
    return {
      ok: false,
      provider,
      storageKey: input.storageKey,
      error: "Missing storage key.",
    };
  }

  if (provider !== FileStorageProvider.UPLOADTHING) {
    return {
      ok: false,
      provider,
      storageKey: input.storageKey,
      error: "unsupported_provider",
    };
  }

  try {
    await utapi.deleteFiles([input.storageKey]);

    return {
      ok: true,
      provider,
      storageKey: input.storageKey,
    };
  } catch (error) {
    return {
      ok: false,
      provider,
      storageKey: input.storageKey,
      error:
        error instanceof Error
          ? error.message
          : "Unable to delete storage object.",
    };
  }
}
