import { prisma } from "@/lib/prisma";

export type PublicPromotionHighlight = {
  title: string;
  description?: string;
};

export type PublicPromotionStep = {
  number: string;
  title: string;
  description: string;
};

export type PublicPromotionTerm = {
  title: string;
  description: string;
};

export type PublicOfferCta = {
  enabled: boolean;
  label: string;
  link: string | null;
};

type PromotionMetadata = {
  claimCtaEnabled?: boolean;
  claimCtaLabel?: string | null;
  claimCtaLink?: string | null;
};

function isPromotionHighlight(
  value: unknown,
): value is PublicPromotionHighlight {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.title === "string" &&
    (item.description === undefined || typeof item.description === "string")
  );
}

function isPromotionStep(value: unknown): value is PublicPromotionStep {
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

function isPromotionTerm(value: unknown): value is PublicPromotionTerm {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return typeof item.title === "string" && typeof item.description === "string";
}

function getPromotionMetadata(value: unknown): PromotionMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const metadata = value as Record<string, unknown>;

  return {
    claimCtaEnabled:
      typeof metadata.claimCtaEnabled === "boolean"
        ? metadata.claimCtaEnabled
        : false,

    claimCtaLabel:
      typeof metadata.claimCtaLabel === "string"
        ? metadata.claimCtaLabel
        : null,

    claimCtaLink:
      typeof metadata.claimCtaLink === "string" ? metadata.claimCtaLink : null,
  };
}

function getPublicOfferCta(metadata: unknown): PublicOfferCta {
  const promotionMetadata = getPromotionMetadata(metadata);

  const enabled = promotionMetadata.claimCtaEnabled === true;

  return {
    enabled,
    label: promotionMetadata.claimCtaLabel?.trim() || "CLAIM",
    link: enabled ? (promotionMetadata.claimCtaLink ?? null) : null,
  };
}

export async function getPublicOfferBySlug(slug: string) {
  const now = new Date();

  const campaign = await prisma.promotionCampaign.findFirst({
    where: {
      slug,
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
    select: {
      id: true,
      slug: true,
      title: true,
      subject: true,
      promotionType: true,
      isFeatured: true,

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

  const cta = getPublicOfferCta(campaign.metadata);

  return {
    id: campaign.id,
    slug: campaign.slug!,
    title: campaign.title,
    subject: campaign.subject,
    promotionType: campaign.promotionType,
    isFeatured: campaign.isFeatured,

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

    cta,

    createdAt: campaign.createdAt.toISOString(),
  };
}
