export function getPromotionCampaignTypeLabel(rewardEnabled: boolean) {
  return rewardEnabled ? "Promo Invite" : "Broadcast";
}

export function getPromotionCampaignStatusLabel(input: {
  status: string;
  rewardEnabled: boolean;
  expiresAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  failedAt: string | null;
}) {
  if (input.status === "DRAFT") {
    return "Draft";
  }

  if (
    input.rewardEnabled &&
    input.expiresAt &&
    new Date(input.expiresAt).getTime() < Date.now() &&
    input.status !== "SENT"
  ) {
    return "Expired";
  }

  if (
    input.status === "SENT" ||
    Boolean(input.completedAt) ||
    Boolean(input.cancelledAt) ||
    Boolean(input.failedAt)
  ) {
    return "Completed";
  }

  return "Active";
}
