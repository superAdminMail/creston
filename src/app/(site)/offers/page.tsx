import { prisma } from "@/lib/prisma";
import OffersClient from "./OffersClient";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

function isPromotionHighlight(
  value: unknown,
): value is { title: string; description?: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.title === "string" &&
    (item.description === undefined || typeof item.description === "string")
  );
}

function isPromotionStep(value: unknown): value is {
  number: string;
  title: string;
  description: string;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.number === "string" &&
    typeof item.title === "string" &&
    typeof item.description === "string"
  );
}

function isPromotionTerm(value: unknown): value is {
  title: string;
  description: string;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return typeof item.title === "string" && typeof item.description === "string";
}

const campaignSelect = {
  id: true,
  slug: true,
  title: true,
  subject: true,
  promotionType: true,
  description: true,
  highlights: true,
  steps: true,
  terms: true,
  rewardEnabled: true,
  rewardAmount: true,
  rewardCurrency: true,
  promoCode: true,
  startsAt: true,
  expiresAt: true,
  maxRedemptions: true,
  redemptionCount: true,
  metadata: true,
  createdAt: true,
} as const;

export default async function OffersPage() {
  const now = new Date();

  const [site, siteConfiguration] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);

  const baseAvailability = {
    isPublic: true,
    status: "SENT" as const,
    AND: [
      {
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      },
      {
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    ],
  };

  const [featuredCampaign, campaigns] = await Promise.all([
    prisma.promotionCampaign.findFirst({
      where: {
        ...baseAvailability,
        isFeatured: true,
      },
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      select: campaignSelect,
    }),

    prisma.promotionCampaign.findMany({
      where: {
        ...baseAvailability,
        isFeatured: false,
      },
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      select: campaignSelect,
    }),
  ]);

  function serializeCampaign(campaign: typeof featuredCampaign) {
    if (!campaign) {
      return null;
    }

    const highlights = Array.isArray(campaign.highlights)
      ? campaign.highlights.filter(isPromotionHighlight)
      : [];

    const steps = Array.isArray(campaign.steps)
      ? campaign.steps.filter(isPromotionStep)
      : [];

    const terms = Array.isArray(campaign.terms)
      ? campaign.terms.filter(isPromotionTerm)
      : [];

    return {
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      subject: campaign.subject,
      promotionType: campaign.promotionType,
      description: campaign.description,
      highlights,
      steps,
      terms,
      rewardEnabled: campaign.rewardEnabled,
      rewardAmount: campaign.rewardAmount.toString(),
      rewardCurrency: campaign.rewardCurrency,
      promoCode: campaign.promoCode,
      startsAt: campaign.startsAt?.toISOString() ?? null,
      expiresAt: campaign.expiresAt?.toISOString() ?? null,
      maxRedemptions: campaign.maxRedemptions,
      redemptionCount: campaign.redemptionCount,
      metadata: campaign.metadata,
      createdAt: campaign.createdAt.toISOString(),
    };
  }

  const serializedFeaturedCampaign = serializeCampaign(featuredCampaign);

  const serializedCampaigns = campaigns.map((campaign) =>
    serializeCampaign(campaign),
  );

  const visibleCampaigns = serializedCampaigns.filter(
    (campaign): campaign is NonNullable<typeof campaign> =>
      Boolean(campaign?.slug),
  );

  const visibleFeaturedCampaign = serializedFeaturedCampaign?.slug
    ? serializedFeaturedCampaign
    : null;

  return (
    <OffersClient
      featuredCampaign={visibleFeaturedCampaign}
      campaigns={visibleCampaigns}
      siteName={siteConfiguration?.siteName?.trim() || "Company"}
    />
  );
}
