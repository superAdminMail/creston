import type { Offer } from "./types";

export function getStatusText(offer: Offer) {
  const now = new Date();

  if (offer.startsAt && new Date(offer.startsAt) > now) {
    return "Coming soon";
  }

  if (offer.expiresAt && new Date(offer.expiresAt) <= now) {
    return "Expired";
  }

  if (
    offer.maxRedemptions !== null &&
    offer.redemptionCount >= offer.maxRedemptions
  ) {
    return "Fully claimed";
  }

  return "Available now";
}
