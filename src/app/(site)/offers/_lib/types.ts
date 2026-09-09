export type Highlight = {
  title: string;
  description?: string;
};

export type OfferTerm = {
  title: string;
  description: string;
};

export type OfferStep = {
  number: string;
  title: string;
  description: string;
};

export type OfferCta = {
  enabled: boolean;
  label: string;
  link: string | null;
};

export type Offer = {
  id: string;
  slug: string;
  title: string;
  subject: string | null;
  promotionType: string;
  description: string | null;
  highlights: Highlight[];
  terms: OfferTerm[];
  steps: OfferStep[];

  rewardEnabled: boolean;
  rewardAmount: string;
  rewardCurrency: string;
  promoCode: string | null;

  startsAt: string | null;
  expiresAt: string | null;
  maxRedemptions: number | null;
  redemptionCount: number;

  metadata: unknown;

  cta: OfferCta;

  createdAt: string;
  isFeatured: boolean;
};

export type OfferPresentation = {
  eyebrow: string;
  category: string;
  badge: string;
  cta: string;
  heroLabel: string;
  heroTitle: string;
};

export type OfferHeroStat = {
  label: string;
  value: string;
};

export type OfferDetail = {
  label: string;
  value: string;
};
