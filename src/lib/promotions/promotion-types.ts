import { z } from "zod";

export const PROMOTION_TYPES = {
  ANNOUNCEMENT: "ANNOUNCEMENT",
  OFFER: "OFFER",
  REMINDER: "REMINDER",
  SYSTEM: "SYSTEM",
} as const;

export type PromotionType =
  (typeof PROMOTION_TYPES)[keyof typeof PROMOTION_TYPES];

export const promotionTypeSchema = z.enum(
  Object.values(PROMOTION_TYPES) as [PromotionType, ...PromotionType[]],
);

export const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  ANNOUNCEMENT: "Announcement",
  OFFER: "Offer",
  REMINDER: "Reminder",
  SYSTEM: "System",
};

export function getPromotionTypeLabel(promotionType: PromotionType): string {
  return PROMOTION_TYPE_LABELS[promotionType];
}

export type PromotionHighlight = {
  title: string;
  description?: string;
};

export type PromotionStep = {
  number: string;
  title: string;
  description: string;
};

export type PromotionTerm = {
  title: string;
  description: string;
};

export type PromotionCampaignDetails = {
  id: string;
  title: string;
  promotionType: PromotionType;
  subject: string | null;

  message: string | null;

  description: string | null;
  highlights: PromotionHighlight[];
  steps: PromotionStep[];
  terms: PromotionTerm[];

  promoCode: string | null;
};
