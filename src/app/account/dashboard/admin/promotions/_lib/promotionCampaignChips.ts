export function getPromotionCampaignTypeLabel(rewardEnabled: boolean) {
  return rewardEnabled ? "Promo Invite" : "Broadcast";
}

const PROMOTION_BADGE_BASE_CLASS =
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em]";

export function getPromotionCampaignTypeBadgeClass(rewardEnabled: boolean) {
  return `${PROMOTION_BADGE_BASE_CLASS} ${
    rewardEnabled
      ? "border-violet-200/80 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200"
      : "border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200"
  }`;
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

export function getPromotionCampaignStatusBadgeClass(input: {
  status: string;
  rewardEnabled: boolean;
  expiresAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  failedAt: string | null;
}) {
  const statusLabel = getPromotionCampaignStatusLabel(input);

  switch (statusLabel) {
    case "Active":
      return `${PROMOTION_BADGE_BASE_CLASS} border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200`;
    case "Completed":
      return `${PROMOTION_BADGE_BASE_CLASS} border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200`;
    case "Expired":
      return `${PROMOTION_BADGE_BASE_CLASS} border-amber-200/80 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200`;
    case "Draft":
    default:
      return `${PROMOTION_BADGE_BASE_CLASS} border-slate-200/80 bg-slate-100 text-slate-700 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-200`;
  }
}

export function getPromotionCampaignMetaBadgeClass() {
  return `${PROMOTION_BADGE_BASE_CLASS} border-slate-200/80 bg-white/90 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200`;
}
