"use server";

import { revalidatePath } from "next/cache";

import {
  PromotionAudienceType,
  PromotionCampaignStatus,
  PromotionChannel,
  PromotionDeliveryStatus,
  UserRole,
} from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import {
  createPromotionCampaignSchema,
  type CreatePromotionCampaignInput,
} from "@/lib/zodValidations/promotion";

export type CreatePromotionCampaignActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  campaignId?: string;
};

async function getAudienceUserIds(input: CreatePromotionCampaignInput) {
  if (input.audienceType === PromotionAudienceType.SINGLE_USER) {
    const user = await prisma.user.findUnique({
      where: { id: input.userId! },
      select: {
        id: true,
        email: true,
        isDeleted: true,
      },
    });

    if (!user || user.isDeleted) {
      throw new Error("Selected user was not found.");
    }

    return [user.id];
  }

  const users = await prisma.user.findMany({
    where: {
      isDeleted: false,
      role: {
        in: [
          UserRole.USER,
          UserRole.MODERATOR,
          UserRole.ADMIN,
          UserRole.SUPER_ADMIN,
        ],
      },
    },
    select: {
      id: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users.map((user) => user.id);
}

export async function createPromotionCampaignAction(
  _prevState: CreatePromotionCampaignActionState,
  formData: FormData,
): Promise<CreatePromotionCampaignActionState> {
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

  const rawInput: CreatePromotionCampaignInput = {
    title: String(formData.get("title") ?? ""),
    promotionType: String(
      formData.get("promotionType") ?? "",
    ) as CreatePromotionCampaignInput["promotionType"],
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
    audienceType: String(
      formData.get("audienceType") ?? "",
    ) as PromotionAudienceType,
    channel: String(formData.get("channel") ?? "") as PromotionChannel,
    userId: String(formData.get("userId") ?? "") || undefined,
  };

  const parsed = createPromotionCampaignSchema.safeParse(rawInput);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      status: "error",
      message: firstIssue?.message ?? "Invalid campaign input.",
    };
  }

  const input = parsed.data;

  try {
    const audienceUserIds = await getAudienceUserIds(input);

    if (audienceUserIds.length === 0) {
      return {
        status: "error",
        message: "No eligible users found for this promotion.",
      };
    }

    const campaign = await prisma.$transaction(async (tx) => {
      const createdCampaign = await tx.promotionCampaign.create({
        data: {
          createdByUserId: sessionUser.userId,
          title: input.title,
          subject: input.subject?.trim() || null,
          message: input.message,
          audienceType: input.audienceType,
          channel: input.channel,
          sendToAllUsers:
            input.audienceType === PromotionAudienceType.BROADCAST_ALL_USERS,
          status: PromotionCampaignStatus.PROCESSING,
          startedAt: new Date(),
          metadata: {
            promotionType: input.promotionType,
          },
        },
        select: {
          id: true,
          channel: true,
          title: true,
          subject: true,
          message: true,
        },
      });

      const users = await tx.user.findMany({
        where: {
          id: {
            in: audienceUserIds,
          },
          isDeleted: false,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      if (createdCampaign.channel === PromotionChannel.IN_APP) {
        for (const user of users) {
          const notification = await tx.notification.create({
            data: {
              userId: user.id,
              title: createdCampaign.title,
              message: createdCampaign.message,
              type: "SYSTEM",
              key: `promotion:${createdCampaign.id}:inapp:${user.id}`,
              metadata: {
                campaignId: createdCampaign.id,
                audienceType: input.audienceType,
                campaignType: input.promotionType,
                channel: createdCampaign.channel,
                promotionType: input.promotionType,
              },
            },
            select: {
              id: true,
            },
          });

          await tx.promotionDelivery.create({
            data: {
              campaignId: createdCampaign.id,
              userId: user.id,
              channel: PromotionChannel.IN_APP,
              status: PromotionDeliveryStatus.SENT,
              notificationId: notification.id,
              deliveredAt: new Date(),
            },
          });
        }
      }

      if (createdCampaign.channel === PromotionChannel.EMAIL) {
        for (const user of users) {
          if (!user.email) {
            await tx.promotionDelivery.create({
              data: {
                campaignId: createdCampaign.id,
                userId: user.id,
                channel: PromotionChannel.EMAIL,
                status: PromotionDeliveryStatus.FAILED,
                failureMessage: "User has no email address.",
                failedAt: new Date(),
                emailAddress: null,
              },
            });
            continue;
          }

          // Replace this block with your real mail sender.
          // Example:
          // await sendEmail({
          //   to: user.email,
          //   subject: createdCampaign.subject ?? createdCampaign.title,
          //   react: <PromotionEmailTemplate ... />
          // });

          await tx.promotionDelivery.create({
            data: {
              campaignId: createdCampaign.id,
              userId: user.id,
              channel: PromotionChannel.EMAIL,
              status: PromotionDeliveryStatus.SENT,
              emailAddress: user.email,
              emailSentAt: new Date(),
              deliveredAt: new Date(),
            },
          });
        }
      }

      await tx.promotionCampaign.update({
        where: { id: createdCampaign.id },
        data: {
          status: PromotionCampaignStatus.SENT,
          completedAt: new Date(),
        },
      });

      return createdCampaign;
    });

    revalidatePath("/account/dashboard/admin/promotions");

    return {
      status: "success",
      message:
        input.audienceType === PromotionAudienceType.BROADCAST_ALL_USERS
          ? "Promotion broadcast sent successfully."
          : "Promotion sent successfully.",
      campaignId: campaign.id,
    };
  } catch (error) {
    console.error("createPromotionCampaignAction error:", error);

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to create and send promotion campaign.",
    };
  }
}
