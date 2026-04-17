import type { NotificationDTO } from "@/lib/types/notification";

export const INVESTMENT_ORDER_BANK_INFO_REQUEST_KIND =
  "INVESTMENT_ORDER_BANK_INFO_REQUEST";
export const INVESTMENT_ORDER_BANK_INFO_REQUEST_ACK_KIND =
  "INVESTMENT_ORDER_BANK_INFO_REQUEST_ACK";
export const INVESTMENT_ORDER_BANK_INFO_READY_KIND =
  "INVESTMENT_ORDER_BANK_INFO_READY";

type NotificationLike = Pick<NotificationDTO, "type" | "metadata">;

export type InvestmentOrderBankInfoRequestMetadata = {
  kind: typeof INVESTMENT_ORDER_BANK_INFO_REQUEST_KIND;
  orderId: string;
  requesterId: string;
  requesterName: string | null;
  requesterEmail: string | null;
  investmentPlanName: string;
  currency: string;
};

export type InvestmentOrderBankInfoRequestAckMetadata = {
  kind: typeof INVESTMENT_ORDER_BANK_INFO_REQUEST_ACK_KIND;
  orderId: string;
  requesterId: string;
};

export type InvestmentOrderBankInfoReadyMetadata = {
  kind: typeof INVESTMENT_ORDER_BANK_INFO_READY_KIND;
  orderId: string;
  requesterId: string;
  platformPaymentMethodId: string;
  respondedByUserId: string;
  respondedByRole: string;
};

function getNotificationKind(notification?: NotificationLike | null) {
  return typeof notification?.metadata?.kind === "string"
    ? notification.metadata.kind
    : null;
}

export function isInvestmentOrderBankInfoRequestNotification(
  notification?: NotificationLike | null,
) {
  return (
    getNotificationKind(notification) ===
    INVESTMENT_ORDER_BANK_INFO_REQUEST_KIND
  );
}

export function isInvestmentOrderBankInfoRequestAckNotification(
  notification?: NotificationLike | null,
) {
  return (
    getNotificationKind(notification) ===
    INVESTMENT_ORDER_BANK_INFO_REQUEST_ACK_KIND
  );
}

export function isInvestmentOrderBankInfoReadyNotification(
  notification?: NotificationLike | null,
) {
  return (
    getNotificationKind(notification) ===
    INVESTMENT_ORDER_BANK_INFO_READY_KIND
  );
}

