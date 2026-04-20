export const SAVINGS_FUNDING_BANK_INFO_REQUEST_KIND =
  "SAVINGS_FUNDING_BANK_INFO_REQUEST";
export const SAVINGS_FUNDING_BANK_INFO_REQUEST_ACK_KIND =
  "SAVINGS_FUNDING_BANK_INFO_REQUEST_ACK";

type NotificationLike = {
  metadata?: unknown;
};

export type SavingsFundingBankInfoRequestMetadata = {
  kind: typeof SAVINGS_FUNDING_BANK_INFO_REQUEST_KIND;
  savingsAccountId: string;
  requesterId: string;
  requesterName: string | null;
  requesterEmail: string | null;
  savingsProductName: string;
  currency: string;
};

export type SavingsFundingBankInfoRequestAckMetadata = {
  kind: typeof SAVINGS_FUNDING_BANK_INFO_REQUEST_ACK_KIND;
  savingsAccountId: string;
  requesterId: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNotificationKind(notification?: NotificationLike | null) {
  if (!isRecord(notification?.metadata)) {
    return null;
  }

  return typeof notification.metadata.kind === "string"
    ? notification.metadata.kind
    : null;
}

export function isSavingsFundingBankInfoRequestNotification(
  notification?: NotificationLike | null,
) {
  return (
    getNotificationKind(notification) ===
    SAVINGS_FUNDING_BANK_INFO_REQUEST_KIND
  );
}

export function isSavingsFundingBankInfoRequestAckNotification(
  notification?: NotificationLike | null,
) {
  return (
    getNotificationKind(notification) ===
    SAVINGS_FUNDING_BANK_INFO_REQUEST_ACK_KIND
  );
}
