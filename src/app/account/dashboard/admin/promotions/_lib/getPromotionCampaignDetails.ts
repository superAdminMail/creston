import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import {
  getPromotionCampaignStatusLabel,
  getPromotionCampaignTypeLabel,
} from "./promotionCampaignChips";

export type PromotionCampaignDetails = {
  id: string;
  title: string;
  subject: string | null;
  message: string;
  promoCode: string | null;
  rewardEnabled: boolean;
  rewardAmount: string;
  rewardCurrency: string;
  startsAt: string | null;
  expiresAt: string | null;
  maxRedemptions: number | null;
  redemptionCount: number;
  campaignTypeLabel: string;
  campaignStatusLabel: string;
  audienceType: string;
  channel: string;
  status: string;
  sendToAllUsers: boolean;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  failedAt: string | null;
  failureMessage: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  };
  deliveries: Array<{
    id: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
    channel: string;
    status: string;
    emailAddress: string | null;
    emailSentAt: string | null;
    deliveredAt: string | null;
    readAt: string | null;
    failedAt: string | null;
    failureMessage: string | null;
    notification: {
      id: string;
      title: string;
      read: boolean;
      createdAt: string;
    } | null;
    createdAt: string;
  }>;
  stats: {
    total: number;
    pending: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    cancelled: number;
  };
};

export async function getPromotionCampaignDetails(
  campaignId: string,
): Promise<PromotionCampaignDetails> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const campaign = await prisma.promotionCampaign.findUnique({
    where: {
      id: campaignId,
    },
    select: {
      id: true,
      title: true,
      subject: true,
      message: true,
      promoCode: true,
      rewardEnabled: true,
      rewardAmount: true,
      rewardCurrency: true,
      startsAt: true,
      expiresAt: true,
      maxRedemptions: true,
      redemptionCount: true,
      audienceType: true,
      channel: true,
      status: true,
      sendToAllUsers: true,
      scheduledAt: true,
      startedAt: true,
      completedAt: true,
      cancelledAt: true,
      failedAt: true,
      failureMessage: true,
      createdAt: true,
      createdByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      deliveries: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          channel: true,
          status: true,
          emailAddress: true,
          emailSentAt: true,
          deliveredAt: true,
          readAt: true,
          failedAt: true,
          failureMessage: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          notification: {
            select: {
              id: true,
              title: true,
              read: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!campaign) {
    notFound();
  }

  const stats = campaign.deliveries.reduce(
    (acc, delivery) => {
      acc.total += 1;

      switch (delivery.status) {
        case "PENDING":
          acc.pending += 1;
          break;
        case "SENT":
          acc.sent += 1;
          break;
        case "DELIVERED":
          acc.delivered += 1;
          break;
        case "READ":
          acc.read += 1;
          break;
        case "FAILED":
          acc.failed += 1;
          break;
        case "CANCELLED":
          acc.cancelled += 1;
          break;
        default:
          break;
      }

      return acc;
    },
    {
      total: 0,
      pending: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
      cancelled: 0,
    },
  );

  return {
    id: campaign.id,
    title: campaign.title,
    subject: campaign.subject,
    message: campaign.message,
    promoCode: campaign.promoCode,
    rewardEnabled: campaign.rewardEnabled,
    rewardAmount: campaign.rewardAmount.toString(),
    rewardCurrency: campaign.rewardCurrency,
    startsAt: campaign.startsAt?.toISOString() ?? null,
    expiresAt: campaign.expiresAt?.toISOString() ?? null,
    maxRedemptions: campaign.maxRedemptions,
    redemptionCount: campaign.redemptionCount,
    campaignTypeLabel: getPromotionCampaignTypeLabel(campaign.rewardEnabled),
    campaignStatusLabel: getPromotionCampaignStatusLabel({
      status: campaign.status,
      rewardEnabled: campaign.rewardEnabled,
      expiresAt: campaign.expiresAt?.toISOString() ?? null,
      completedAt: campaign.completedAt?.toISOString() ?? null,
      cancelledAt: campaign.cancelledAt?.toISOString() ?? null,
      failedAt: campaign.failedAt?.toISOString() ?? null,
    }),
    audienceType: campaign.audienceType,
    channel: campaign.channel,
    status: campaign.status,
    sendToAllUsers: campaign.sendToAllUsers,
    scheduledAt: campaign.scheduledAt?.toISOString() ?? null,
    startedAt: campaign.startedAt?.toISOString() ?? null,
    completedAt: campaign.completedAt?.toISOString() ?? null,
    cancelledAt: campaign.cancelledAt?.toISOString() ?? null,
    failedAt: campaign.failedAt?.toISOString() ?? null,
    failureMessage: campaign.failureMessage ?? null,
    createdAt: campaign.createdAt.toISOString(),
    createdBy: {
      id: campaign.createdByUser.id,
      name: campaign.createdByUser.name,
      email: campaign.createdByUser.email,
    },
    deliveries: campaign.deliveries.map((delivery) => ({
      id: delivery.id,
      user: {
        id: delivery.user.id,
        name: delivery.user.name,
        email: delivery.user.email,
      },
      channel: delivery.channel,
      status: delivery.status,
      emailAddress: delivery.emailAddress ?? null,
      emailSentAt: delivery.emailSentAt?.toISOString() ?? null,
      deliveredAt: delivery.deliveredAt?.toISOString() ?? null,
      readAt: delivery.readAt?.toISOString() ?? null,
      failedAt: delivery.failedAt?.toISOString() ?? null,
      failureMessage: delivery.failureMessage ?? null,
      notification: delivery.notification
        ? {
            id: delivery.notification.id,
            title: delivery.notification.title,
            read: delivery.notification.read,
            createdAt: delivery.notification.createdAt.toISOString(),
          }
        : null,
      createdAt: delivery.createdAt.toISOString(),
    })),
    stats,
  };
}
