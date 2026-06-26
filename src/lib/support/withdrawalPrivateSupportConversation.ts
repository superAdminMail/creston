export const WITHDRAWAL_PRIVATE_SUPPORT_SOURCE_PREFIX =
  "withdrawal-payment-method-support:";

export function getWithdrawalPrivateSupportConversationSource(
  withdrawalId: string,
) {
  return `${WITHDRAWAL_PRIVATE_SUPPORT_SOURCE_PREFIX}${withdrawalId.trim()}`;
}

export function isWithdrawalPrivateSupportConversationSource(
  source?: string | null,
) {
  return Boolean(
    source?.startsWith(WITHDRAWAL_PRIVATE_SUPPORT_SOURCE_PREFIX),
  );
}
