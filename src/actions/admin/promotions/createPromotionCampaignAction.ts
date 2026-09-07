"use server";

import { revalidatePath } from "next/cache";

import {
  PromotionAudienceType,
  PromotionCampaignStatus,
  PromotionChannel,
  PromotionDeliveryStatus,
  Prisma,
  UserRole,
} from "@/generated/prisma";

import { prisma } from "@/lib/prisma";

import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";

import {
  createPromotionCampaignSchema,
  type CreatePromotionCampaignInput,
} from "@/lib/zodValidations/promotion";

import { type PromotionType } from "@/lib/promotions/promotion-types";

import { getPromotionDeliveryMessage } from "@/lib/promotions/getPromotionDeliveryMessage";

export type CreatePromotionCampaignActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  campaignId?: string;
};

async function getAudienceUserIds(input: CreatePromotionCampaignInput) {
  if (input.audienceType === PromotionAudienceType.SINGLE_USER) {
    const user = await prisma.user.findUnique({
      where: {
        id: input.userId!,
      },
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function generateUniqueSlug(tx: Prisma.TransactionClient, title: string) {
  const baseSlug = slugify(title);

  if (!baseSlug) {
    throw new Error("Campaign title cannot generate a valid public URL.");
  }

  const existing = await tx.promotionCampaign.findUnique({
    where: {
      slug: baseSlug,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    return baseSlug;
  }

  return `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
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

  const rawInput = {
    title: String(formData.get("title") ?? ""),
    promotionType: String(formData.get("promotionType") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    description: String(formData.get("description") ?? ""),
    highlights: String(formData.get("highlights") ?? "[]"),
    steps: String(formData.get("steps") ?? "[]"),
    terms: String(formData.get("terms") ?? "[]"),
    audienceType: String(
      formData.get("audienceType") ?? "",
    ) as PromotionAudienceType,
    channel: String(formData.get("channel") ?? "") as PromotionChannel,
    userId: String(formData.get("userId") ?? "") || undefined,
    rewardEnabled: String(formData.get("rewardEnabled") ?? "false") as
      | "true"
      | "false",
    promoCode: String(formData.get("promoCode") ?? "") || undefined,
    rewardAmount: String(formData.get("rewardAmount") ?? "") || undefined,
    rewardCurrency: String(formData.get("rewardCurrency") ?? "") || undefined,
    startsAt: String(formData.get("startsAt") ?? "") || undefined,
    expiresAt: String(formData.get("expiresAt") ?? "") || undefined,
    maxRedemptions: String(formData.get("maxRedemptions") ?? "") || undefined,
    claimCtaEnabled: String(formData.get("claimCtaEnabled") ?? "false") as
      | "true"
      | "false",
    isPublic: String(formData.get("isPublic") ?? "false") as "true" | "false",
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

  const promotionType = input.promotionType as PromotionType;
  const rewardEnabled = input.rewardEnabled === "true";
  const claimCtaEnabled = input.claimCtaEnabled === "true";
  const isPublic = input.isPublic === "true";

  const deliveryMessage = getPromotionDeliveryMessage({
    promotionType,
    title: input.title,
    description: input.description,
    highlights: input.highlights,
    steps: input.steps,
    terms: input.terms,
  });

  let campaignId: string | null = null;

  try {
    const promoCode = rewardEnabled
      ? input.promoCode?.trim().toUpperCase() || null
      : null;

    const rewardAmount = rewardEnabled
      ? new Prisma.Decimal(input.rewardAmount?.trim() || "100")
      : new Prisma.Decimal("100");

    const rewardCurrency = rewardEnabled
      ? input.rewardCurrency?.trim().toUpperCase() || "USD"
      : "USD";

    /**
     * Claim CTA intentionally opens the investment-order flow.
     * The promo code is passed through the URL so the investment
     * order flow can process it.
     */
    const claimCtaLink = claimCtaEnabled
      ? promoCode
        ? `/account/dashboard/user/investment-orders/new?promoCode=${encodeURIComponent(
            promoCode,
          )}`
        : "/account/dashboard/user/investment-orders/new"
      : null;

    const startsAt = input.startsAt?.trim()
      ? new Date(input.startsAt.trim())
      : null;

    const expiresAt = input.expiresAt?.trim()
      ? new Date(input.expiresAt.trim())
      : null;

    if (startsAt && Number.isNaN(startsAt.getTime())) {
      return {
        status: "error",
        message: "Invalid campaign start date.",
      };
    }

    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      return {
        status: "error",
        message: "Invalid campaign expiration date.",
      };
    }

    if (startsAt && expiresAt && expiresAt <= startsAt) {
      return {
        status: "error",
        message: "Campaign expiration must be later than the start date.",
      };
    }

    const maxRedemptions = input.maxRedemptions?.trim()
      ? Number.parseInt(input.maxRedemptions.trim(), 10)
      : null;

    if (
      maxRedemptions !== null &&
      (!Number.isInteger(maxRedemptions) || maxRedemptions < 1)
    ) {
      return {
        status: "error",
        message: "Maximum redemptions must be a positive whole number.",
      };
    }

    if (rewardEnabled && !promoCode) {
      return {
        status: "error",
        message: "A promo code is required for reward campaigns.",
      };
    }

    const audienceUserIds = await getAudienceUserIds(input);

    if (audienceUserIds.length === 0) {
      return {
        status: "error",
        message: "No eligible users found for this promotion.",
      };
    }

    /**
     * Create the campaign first.
     * This transaction is intentionally small.
     */
    const campaign = await prisma.$transaction(async (tx) => {
      const slug = isPublic ? await generateUniqueSlug(tx, input.title) : null;

      if (promoCode) {
        const existingPromoCampaign = await tx.promotionCampaign.findUnique({
          where: {
            promoCode,
          },
          select: {
            id: true,
          },
        });

        if (existingPromoCampaign) {
          throw new Error("A promotion with this promo code already exists.");
        }
      }

      return tx.promotionCampaign.create({
        data: {
          createdByUserId: sessionUser.userId,
          title: input.title,
          promotionType,
          subject: input.subject?.trim() || null,
          message: deliveryMessage,
          description: input.description?.trim() || null,
          highlights: input.highlights,
          steps: input.steps,
          terms: input.terms,
          slug,
          isPublic,
          promoCode,
          rewardEnabled,
          rewardAmount,
          rewardCurrency,
          startsAt,
          expiresAt,
          maxRedemptions,
          audienceType: input.audienceType,
          channel: input.channel,
          sendToAllUsers:
            input.audienceType === PromotionAudienceType.BROADCAST_ALL_USERS,
          status: PromotionCampaignStatus.PROCESSING,
          startedAt: new Date(),
          metadata: {
            rewardEnabled,
            promoCode,
            rewardAmount: rewardAmount.toString(),
            rewardCurrency,
            startsAt: startsAt?.toISOString() ?? null,
            expiresAt: expiresAt?.toISOString() ?? null,
            maxRedemptions,
            claimCtaEnabled,
            claimCtaLabel: claimCtaEnabled ? "CLAIM" : null,
            claimCtaLink,
          },
        },
        select: {
          id: true,
          channel: true,
          title: true,
          subject: true,
          message: true,
          promotionType: true,
          promoCode: true,
          rewardEnabled: true,
          slug: true,
          isPublic: true,
        },
      });
    });

    campaignId = campaign.id;

    const users = await prisma.user.findMany({
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

    if (users.length === 0) {
      throw new Error("No eligible users found for this promotion.");
    }

    /**
     * IN-APP DELIVERY
     *
     * IMPORTANT:
     * Do NOT create one notification + one delivery inside a
     * loop within an interactive transaction.
     *
     * That caused Prisma P2028 because the default transaction
     * timeout is 5 seconds.
     *
     * Instead:
     *   1. create all notifications with createMany()
     *   2. fetch their IDs in one query
     *   3. create all deliveries with createMany()
     *
     * This keeps the transaction to only a few database queries.
     */
    if (campaign.channel === PromotionChannel.IN_APP) {
      const now = new Date();

      const notificationRows = users.map((user) => {
        const notificationKey = `promotion:${campaign.id}:inapp:${user.id}`;

        return {
          userId: user.id,
          title: campaign.title,
          message: campaign.message!,
          type: "SYSTEM",
          key: notificationKey,
          link: claimCtaLink,
          metadata: {
            campaignId: campaign.id,
            promotionType: campaign.promotionType,
            audienceType: input.audienceType,
            channel: campaign.channel,
            actionLabel: claimCtaEnabled ? "CLAIM" : null,
            claimCtaEnabled,
            claimCtaLink,
            rewardEnabled,
          },
        };
      });

      const notificationKeys = notificationRows.map(
        (notification) => notification.key,
      );

      await prisma.$transaction(async (tx) => {
        /**
         * Query 1:
         * Create all notifications at once.
         */
        await tx.notification.createMany({
          data: notificationRows,
        });

        /**
         * Query 2:
         * Fetch the generated notification IDs.
         *
         * The unique notification key lets us reliably map
         * each notification back to its user.
         */
        const notifications = await tx.notification.findMany({
          where: {
            key: {
              in: notificationKeys,
            },
          },
          select: {
            id: true,
            userId: true,
          },
        });

        const notificationIdByUserId = new Map(
          notifications.map((notification) => [
            notification.userId,
            notification.id,
          ]),
        );

        /**
         * Query 3:
         * Create all promotion delivery records at once.
         */
        await tx.promotionDelivery.createMany({
          data: users.map((user) => {
            const notificationId = notificationIdByUserId.get(user.id);

            if (!notificationId) {
              throw new Error(
                `Notification could not be mapped to user ${user.id}.`,
              );
            }

            return {
              campaignId: campaign.id,
              userId: user.id,
              channel: PromotionChannel.IN_APP,
              status: PromotionDeliveryStatus.SENT,
              notificationId,
              deliveredAt: now,
            };
          }),
        });
      });
    }

    /**
     * EMAIL DELIVERY
     *
     * Email sending remains unchanged for now.
     * This only records the intended delivery state.
     */
    if (campaign.channel === PromotionChannel.EMAIL) {
      const now = new Date();

      await prisma.promotionDelivery.createMany({
        data: users.map((user) => ({
          campaignId: campaign.id,
          userId: user.id,
          channel: PromotionChannel.EMAIL,
          status: user.email
            ? PromotionDeliveryStatus.SENT
            : PromotionDeliveryStatus.FAILED,
          emailAddress: user.email,
          emailSentAt: user.email ? now : null,
          deliveredAt: user.email ? now : null,
          failedAt: user.email ? null : now,
          failureMessage: user.email ? null : "User has no email address.",
        })),
      });
    }

    /**
     * Mark campaign as successfully sent only after
     * delivery records have been created.
     */
    await prisma.promotionCampaign.update({
      where: {
        id: campaign.id,
      },
      data: {
        status: PromotionCampaignStatus.SENT,
        completedAt: new Date(),
      },
    });

    revalidatePath("/account/dashboard/admin/promotions");
    revalidatePath("/offers");

    if (campaign.slug) {
      revalidatePath(`/offers/${campaign.slug}`);
    }

    return {
      status: "success",
      message: rewardEnabled
        ? "Reward promotion sent successfully."
        : input.audienceType === PromotionAudienceType.BROADCAST_ALL_USERS
          ? "Promotion broadcast sent successfully."
          : "Promotion sent successfully.",
      campaignId: campaign.id,
    };
  } catch (error) {
    console.error("createPromotionCampaignAction error:", error);

    if (campaignId) {
      try {
        await prisma.promotionCampaign.update({
          where: {
            id: campaignId,
          },
          data: {
            status: PromotionCampaignStatus.FAILED,
            failedAt: new Date(),
            failureMessage: "Promotion delivery processing failed.",
          },
        });
      } catch (statusError) {
        console.error(
          "Failed to mark promotion campaign as FAILED:",
          statusError,
        );
      }
    }

    return {
      status: "error",
      message: "We couldn't send this promotion right now. Please try again.",
    };
  }
}
