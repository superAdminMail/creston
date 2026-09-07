import type { PromotionType } from "./promotion-types";

type PromotionDeliveryContent = {
  promotionType: PromotionType;
  title: string;
  description: string;
  highlights: {
    title: string;
    description?: string;
  }[];
  steps: {
    number: string;
    title: string;
    description: string;
  }[];
  terms: {
    title: string;
    description: string;
  }[];
};

const DEFAULT_DELIVERY_MESSAGES: Record<PromotionType, string> = {
  OFFER: "New offer available. Check it out now.",
  ANNOUNCEMENT: "New announcement available. Check it out now.",
  REMINDER: "You have a reminder. Check it out now.",
  SYSTEM: "New system update. Check it out now.",
};

export function getPromotionDeliveryMessage(
  content: PromotionDeliveryContent,
): string {
  const description = content.description.trim();

  if (description) {
    return description;
  }

  const firstHighlight = content.highlights.find((highlight) =>
    highlight.description?.trim(),
  );

  if (firstHighlight?.description?.trim()) {
    return firstHighlight.description.trim();
  }

  const firstStep = content.steps.find((step) => step.description.trim());

  if (firstStep?.description.trim()) {
    return firstStep.description.trim();
  }

  return DEFAULT_DELIVERY_MESSAGES[content.promotionType];
}
