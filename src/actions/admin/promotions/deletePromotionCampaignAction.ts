"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";

export type DeletePromotionCampaignActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  campaignId?: string;
};

export async function deletePromotionCampaignAction(
  _prevState: DeletePromotionCampaignActionState,
  formData: FormData,
): Promise<DeletePromotionCampaignActionState> {
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

  if (!campaignId) {
    return {
      status: "error",
      message: "Promotion campaign could not be identified.",
    };
  }

  try {
    const campaign = await prisma.promotionCampaign.findUnique({
      where: {
        id: campaignId,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!campaign) {
      return {
        status: "error",
        message: "Promotion campaign was not found.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({
        where: {
          key: {
            startsWith: `promotion:${campaignId}:`,
          },
        },
      });

      await tx.promotionCampaign.delete({
        where: {
          id: campaignId,
        },
      });
    });

    revalidatePath("/account/dashboard/admin/promotions");
    revalidatePath("/account/dashboard/notifications");
    revalidatePath("/account/dashboard");

    return {
      status: "success",
      message: `Promotion "${campaign.title}" was deleted successfully.`,
      campaignId: campaign.id,
    };
  } catch (error) {
    console.error("deletePromotionCampaignAction error:", error);

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to delete this promotion campaign.",
    };
  }
}
