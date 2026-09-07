import type {
  Offer,
  OfferPresentation,
  OfferHeroStat,
  OfferDetail,
} from "./types";

export function getOfferPresentation(offer: Offer): OfferPresentation {
  if (offer.rewardEnabled && offer.isFeatured) {
    return {
      eyebrow: "Featured offer",
      category: "Promotion",
      badge: "Featured promotion",
      cta: "Claim offer",
      heroLabel: "Featured opportunity",
      heroTitle: "Explore with confidence",
    };
  }

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
    eyebrow: offer.isFeatured ? "Featured opportunity" : "Opportunity",
    category: "Opportunity",
    badge: offer.isFeatured ? "Featured opportunity" : "Current opportunity",
    cta: "Get started",
    heroLabel: "Opportunity overview",
    heroTitle: "Explore with confidence",
  };
}

function getOfferType(offer: Offer): string {
  if (offer.rewardEnabled && offer.isFeatured) {
    return "Featured reward promotion";
  }

  if (offer.rewardEnabled) {
    return "Reward promotion";
  }

  if (offer.isFeatured) {
    return "Featured opportunity";
  }

  return "Opportunity";
}

export function getOfferHeroStats(offer: Offer): OfferHeroStat[] {
  const availability =
    offer.maxRedemptions !== null
      ? `${Math.max(offer.maxRedemptions - offer.redemptionCount, 0)} remaining`
      : "Open";

  const stats: OfferHeroStat[] = [
    {
      label: "Offer type",
      value: getOfferType(offer),
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
      value: getOfferType(offer),
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
