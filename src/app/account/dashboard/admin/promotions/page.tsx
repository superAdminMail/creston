import { prisma } from "@/lib/prisma";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";

import PromotionCampaignForm from "./_components/PromotionCampaignForm";
import {
  getPromotionCampaignStatusLabel,
  getPromotionCampaignTypeLabel,
} from "./_lib/promotionCampaignChips";

export default async function AdminPromotionsPage() {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);
  const site = await getSiteConfigurationCached();
  const siteName = site?.siteName?.trim() || "Company";

  const users = await prisma.user.findMany({
    where: {
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 300,
  });

  const recentCampaigns = await prisma.promotionCampaign.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
    select: {
      id: true,
      title: true,
      subject: true,
      audienceType: true,
      channel: true,
      status: true,
      promoCode: true,
      rewardEnabled: true,
      rewardAmount: true,
      rewardCurrency: true,
      maxRedemptions: true,
      redemptionCount: true,
      startsAt: true,
      expiresAt: true,
      cancelledAt: true,
      failedAt: true,
      createdAt: true,
      completedAt: true,
      createdByUser: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          deliveries: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <PromotionCampaignForm
        siteName={siteName}
        users={users.map((item) => ({
          id: item.id,
          name: item.name ?? "",
          email: item.email,
          role: item.role,
        }))}
        recentCampaigns={recentCampaigns.map((campaign) => ({
          id: campaign.id,
          title: campaign.title,
          subject: campaign.subject,
          audienceType: campaign.audienceType,
          channel: campaign.channel,
          status: campaign.status,
          promoCode: campaign.promoCode,
          rewardEnabled: campaign.rewardEnabled,
          rewardAmount: campaign.rewardAmount.toString(),
          rewardCurrency: campaign.rewardCurrency,
          maxRedemptions: campaign.maxRedemptions,
          redemptionCount: campaign.redemptionCount,
          startsAt: campaign.startsAt?.toISOString() ?? null,
          expiresAt: campaign.expiresAt?.toISOString() ?? null,
          cancelledAt: campaign.cancelledAt?.toISOString() ?? null,
          failedAt: campaign.failedAt?.toISOString() ?? null,
          campaignTypeLabel: getPromotionCampaignTypeLabel(
            campaign.rewardEnabled,
          ),
          campaignStatusLabel: getPromotionCampaignStatusLabel({
            status: campaign.status,
            rewardEnabled: campaign.rewardEnabled,
            expiresAt: campaign.expiresAt?.toISOString() ?? null,
            completedAt: campaign.completedAt?.toISOString() ?? null,
            cancelledAt: campaign.cancelledAt?.toISOString() ?? null,
            failedAt: campaign.failedAt?.toISOString() ?? null,
          }),
          createdAt: campaign.createdAt.toISOString(),
          completedAt: campaign.completedAt?.toISOString() ?? null,
          createdBy:
            campaign.createdByUser.name ||
            campaign.createdByUser.email ||
            "Unknown admin",
          deliveryCount: campaign._count.deliveries,
        }))}
      />
    </div>
  );
}
