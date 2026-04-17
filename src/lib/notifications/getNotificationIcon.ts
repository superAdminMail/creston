import { createElement } from "react";
import { ShoppingBag, CreditCard, Megaphone, Bell } from "lucide-react";

import type { NotificationDTO } from "@/lib/types/notification";
import {
  isInvestmentOrderBankInfoReadyNotification,
  isInvestmentOrderBankInfoRequestNotification,
} from "@/lib/notifications/investmentOrderBankInfo";

export function getNotificationIcon(
  notification?: Pick<NotificationDTO, "type" | "metadata">,
) {
  const isPromotion =
    notification?.type === "PROMOTION" ||
    notification?.metadata?.campaignType === "PROMOTION";

  const isInvestmentBankInfo =
    isInvestmentOrderBankInfoRequestNotification(notification) ||
    isInvestmentOrderBankInfoReadyNotification(notification);

  if (isPromotion) {
    return Megaphone;
  }

  if (isInvestmentBankInfo) {
    return CreditCard;
  }

  switch (notification?.type) {
    case "INVESTMENT_ORDER":
      return ShoppingBag;

    case "INVESTMENT_ROI":
      return CreditCard;

    case "WITHDRAWAL":
      return CreditCard;

    default:
      return Bell;
  }
}

export function renderNotificationIcon(
  notification?: Pick<NotificationDTO, "type" | "metadata">,
  className = "h-4 w-4",
) {
  const Icon = getNotificationIcon(notification);

  return createElement(Icon, { className });
}
