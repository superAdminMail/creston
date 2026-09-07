import type {
  Offer,
  OfferPresentation,
  OfferHeroStat,
  OfferDetail,
} from "./types";

export function getOfferPresentation(offer: Offer): OfferPresentation {
  if (offer.rewardEnabled) {
    return {
      eyebrow: "Special offer",
      category: "Promotion",
      badge: "Limited promotion",
      cta: "Claim offer",
      heroLabel: "Exclusive opportunity",
      heroTitle: "Explore with confidence",
    };
  }

  return {
    eyebrow: "Featured opportunity",
    category: "Opportunity",
    badge: "Featured opportunity",
    cta: "Get started",
    heroLabel: "Opportunity overview",
    heroTitle: "Explore with confidence",
  };
}

export function getOfferHeroStats(offer: Offer): OfferHeroStat[] {
  const availability =
    offer.maxRedemptions !== null
      ? `${Math.max(offer.maxRedemptions - offer.redemptionCount, 0)} remaining`
      : "Open";

  const stats: OfferHeroStat[] = [
    {
      label: "Offer type",
      value: offer.rewardEnabled ? "Reward promotion" : "Featured opportunity",
    },
  ];

  if (offer.rewardEnabled) {
    stats.push({
      label: "Reward",
      value: `${offer.rewardCurrency} ${offer.rewardAmount}`,
    });
  }

  stats.push({
    label: "Availability",
    value: availability,
  });

  return stats;
}

export function getOfferDetails(offer: Offer): OfferDetail[] {
  const details: OfferDetail[] = [
    {
      label: "Offer type",
      value: offer.rewardEnabled ? "Reward promotion" : "Featured opportunity",
    },
    {
      label: "Status",
      value: "Available now",
    },
  ];

  if (offer.rewardEnabled) {
    details.push({
      label: "Reward",
      value: `${offer.rewardCurrency} ${offer.rewardAmount}`,
    });
  }

  if (offer.maxRedemptions !== null) {
    details.push({
      label: "Remaining",
      value: `${Math.max(offer.maxRedemptions - offer.redemptionCount, 0)}`,
    });
  }

  if (offer.startsAt) {
    details.push({
      label: "Available from",
      value: formatDate(offer.startsAt),
    });
  }

  if (offer.expiresAt) {
    details.push({
      label: "Available until",
      value: formatDate(offer.expiresAt),
    });
  }

  return details;
}

export function getOfferDescription(offer: Offer): string {
  return (
    offer.description?.trim() || "Explore this opportunity from Havenstone."
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
