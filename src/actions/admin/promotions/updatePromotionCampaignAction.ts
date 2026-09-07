"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";

export type UpdatePromotionCampaignActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  campaignId?: string;
};

export async function updatePromotionCampaignAction(
  _prevState: UpdatePromotionCampaignActionState,
  formData: FormData,
): Promise<UpdatePromotionCampaignActionState> {
  const sessionUser = await requireDashboardRoleAccess([
    "ADMIN",
    "SUPER_ADMIN",
  ]);

  if (!sessionUser?.userId) {
    return {
      status: "error",
      message: "Unauthorized.",
    };
  }

  const campaignId = String(formData.get("campaignId") ?? "").trim();
  const isPublic = String(formData.get("isPublic") ?? "false") === "true";
  const isFeatured = String(formData.get("isFeatured") ?? "false") === "true";

  if (!campaignId) {
    return {
      status: "error",
      message: "Promotion campaign ID is required.",
    };
  }

  if (isFeatured && !isPublic) {
    return {
      status: "error",
      message: "A featured promotion must be public.",
    };
  }

  try {
    const campaign = await prisma.$transaction(async (tx) => {
      const existingCampaign = await tx.promotionCampaign.findUnique({
        where: {
          id: campaignId,
        },
        select: {
          id: true,
          slug: true,
        },
      });

      if (!existingCampaign) {
        throw new Error("Promotion campaign not found.");
      }

      if (isFeatured) {
        await tx.promotionCampaign.updateMany({
          where: {
            isFeatured: true,
            id: {
              not: campaignId,
            },
          },
          data: {
            isFeatured: false,
          },
        });
      }

      return tx.promotionCampaign.update({
        where: {
          id: campaignId,
        },
        data: {
          isPublic,
          isFeatured,
        },
        select: {
          id: true,
          slug: true,
          isPublic: true,
          isFeatured: true,
        },
      });
    });

    revalidatePath("/account/dashboard/admin/promotions");
    revalidatePath("/offers");

    if (campaign.slug) {
      revalidatePath(`/offers/${campaign.slug}`);
    }

    return {
      status: "success",
      message: campaign.isFeatured
        ? "Promotion is now featured."
        : "Promotion updated successfully.",
      campaignId: campaign.id,
    };
  } catch (error) {
    console.error("updatePromotionCampaignAction error:", error);

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We couldn't update this promotion right now.",
    };
  }
}
