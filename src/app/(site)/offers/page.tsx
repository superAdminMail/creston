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

export default async function OffersPage() {
  const now = new Date();

  const [site, siteConfiguration] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);

  const campaigns = await prisma.promotionCampaign.findMany({
    where: {
      isPublic: true,
      status: "SENT",
      AND: [
        {
          OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        },
        {
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      ],
    },
    orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
    select: {
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
    },
  });

  const serializedCampaigns = campaigns.map((campaign) => {
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

      // Canonical campaign content
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
  });

  return (
    <OffersClient
      campaigns={serializedCampaigns}
      siteName={siteConfiguration?.siteName?.trim() || "Company"}
    />
  );
}
