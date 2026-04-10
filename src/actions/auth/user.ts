"use server";

import { prisma } from "@/lib/prisma";
import type { FormFieldErrors } from "@/lib/forms/actionState";
import { getFriendlyServerError } from "@/lib/forms/actionState";

import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";
// import { ensureFileAsset } from "@/lib/file-assets";
// import { touchOrMarkFileAssetOrphaned } from "@/lib/product-images";
// import { userProfileAvatarInclude } from "@/lib/media-views";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import {
  updateUserSchema,
  updateUserSchemaType,
} from "@/lib/zodValidations/user";

const utapi = new UTApi();

type UpdateUserProfileFieldName = "name" | "username" | "email" | "profileAvatar";

export type UpdateUserProfileResult = {
  success?: true;
  error?: string;
  fieldErrors?: FormFieldErrors<UpdateUserProfileFieldName>;
};

export const deleteProfileAvatarAction = async () => {
  const user = await getCurrentSessionUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        profileAvatarFileAssetId: true,
        profileAvatarFileAsset: {
          select: {
            storageKey: true,
          },
        },
      },
    });

    if (!dbUser?.profileAvatarFileAssetId) {
      return { error: "No profile avatar to delete" };
    }

    const avatarKey = dbUser.profileAvatarFileAsset?.storageKey;

    if (avatarKey) {
      await utapi.deleteFiles([avatarKey]);
    }

    await prisma.$transaction(async (tx) => {
      const previousProfileAvatarFileAssetId = dbUser.profileAvatarFileAssetId;

      await tx.user.update({
        where: { id: user.id },
        data: {
          profileAvatarFileAssetId: null,
        },
      });

      //   if (previousProfileAvatarFileAssetId) {
      //     await touchOrMarkFileAssetOrphaned(
      //       tx,
      //       previousProfileAvatarFileAssetId,
      //     );
      //   }
    });

    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Could not delete profile image" };
  }
};

//update user profile action
export async function updateUserProfile(
  values: updateUserSchemaType,
): Promise<UpdateUserProfileResult> {
  const parsed = updateUserSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: "Please review the highlighted profile fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, username, profileAvatar } = parsed.data;

  const user = await getCurrentSessionUser();
  if (!user) return { error: "Unauthorized" };

  if (username) {
    const existing = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id: user.id },
      },
    });

    if (existing) {
      return {
        error: "Please choose a different username.",
        fieldErrors: {
          username: ["Username already taken."],
        },
      };
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const currentUser = await tx.user.findUnique({
        where: { id: user.id },
        //  include: userProfileAvatarInclude,
      });

      let nextProfileAvatarFileAssetId: string | null | undefined = undefined;
      let previousProfileAvatarFileAssetId: string | null = null;

      if (profileAvatar !== undefined) {
        previousProfileAvatarFileAssetId =
          currentUser?.profileAvatarFileAssetId ?? null;

        if (profileAvatar === null) {
          nextProfileAvatarFileAssetId = null;
        } else {
          // const asset = await ensureFileAsset(tx, {
          //   uploadedById: user.id,
          //   file: profileAvatar,
          //   category: "PROFILE_IMAGE",
          //   kind: "IMAGE",
          //   isPublic: true,
          // });
          // nextProfileAvatarFileAssetId = asset.id;
        }
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          name,
          username,
          profileAvatarFileAssetId: nextProfileAvatarFileAssetId,
        },
      });

      // if (
      //   previousProfileAvatarFileAssetId &&
      //   previousProfileAvatarFileAssetId !== nextProfileAvatarFileAssetId
      // ) {
      //   await touchOrMarkFileAssetOrphaned(tx, previousProfileAvatarFileAssetId);
      // }
    });

    revalidatePath("/account/dashboard/profile/update");

    return { success: true };
  } catch (error) {
    return {
      error: getFriendlyServerError(
        error,
        "We could not update your profile right now.",
      ),
    };
  }
}
