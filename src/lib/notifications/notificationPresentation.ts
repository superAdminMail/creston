import type { NotificationDTO } from "@/lib/types/notification";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import {
  isInvestmentOrderBankInfoReadyNotification,
  isInvestmentOrderBankInfoRequestNotification,
} from "@/lib/notifications/investmentOrderBankInfo";
import {
  isSavingsFundingBankInfoRequestAckNotification,
  isSavingsFundingBankInfoRequestNotification,
} from "@/lib/notifications/savingsFundingBankInfo";

function isPromotionNotification(notification?: Pick<
  NotificationDTO,
  "type" | "metadata"
> | null) {
  const promotionType = notification?.metadata?.promotionType;
  return (
    promotionType === "ANNOUNCEMENT" ||
    promotionType === "OFFER" ||
    promotionType === "REMINDER" ||
    promotionType === "SYSTEM" ||
    notification?.type === "PROMOTION" ||
    notification?.metadata?.campaignType === "PROMOTION"
  );
}

function isSupportNotification(notification?: Pick<
  NotificationDTO,
  "type" | "metadata"
> | null) {
  return notification?.metadata?.kind === "support_ticket" || notification?.metadata?.kind === "support_reply";
}

export function getNotificationDisplayType(
  notification?: Pick<NotificationDTO, "type" | "metadata"> | null,
) {
  const promotionType = notification?.metadata?.promotionType;

  if (typeof promotionType === "string") {
    return formatEnumLabel(promotionType);
  }

  if (isPromotionNotification(notification)) {
    return "Promotion";
  }

  if (isSupportNotification(notification)) {
    return notification?.metadata?.kind === "support_reply"
      ? "Support Reply"
      : "Support Ticket";
  }

  if (isInvestmentOrderBankInfoRequestNotification(notification)) {
    return "Bank Info Request";
  }

  if (
    isSavingsFundingBankInfoRequestNotification(notification) ||
    isSavingsFundingBankInfoRequestAckNotification(notification)
  ) {
    return "Bank Info Request";
  }

  if (isInvestmentOrderBankInfoReadyNotification(notification)) {
    return "Bank Info Ready";
  }

  if (!notification?.type) {
    return "System";
  }

  return notification.type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function isPromotionNotificationType(
  notification?: Pick<NotificationDTO, "type" | "metadata"> | null,
) {
  return isPromotionNotification(notification);
}
