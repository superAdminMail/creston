import { prisma } from "@/lib/prisma";
import {
  INVESTMENT_ORDER_BANK_INFO_READY_KIND,
} from "@/lib/notifications/investmentOrderBankInfo";
import {
  SAVINGS_FUNDING_BANK_INFO_REQUEST_ACK_KIND,
} from "@/lib/notifications/savingsFundingBankInfo";

type PrivateBankMethod = {
  id: string;
  label: string;
  type: string;
  providerName: string | null;
  bankName: string | null;
  bankCode: string | null;
  accountName: string | null;
  reference: string | null;
  bankAddress: string | null;
  accountNumber: string | null;
  iban: string | null;
  swiftCode: string | null;
  routingNumber: string | null;
  branchName: string | null;
  country: string | null;
  instructions: string | null;
  notes: string | null;
  isPrivate: boolean;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  verificationStatus: string;
  cryptoAsset: string | null;
  cryptoNetwork: string | null;
  walletAddress: string | null;
  walletTag: string | null;
  currency: string | null;
};

type NotificationLike = {
  metadata?: unknown;
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

function getPlatformPaymentMethodId(notification?: NotificationLike | null) {
  if (!isRecord(notification?.metadata)) {
    return null;
  }

  return typeof notification.metadata.platformPaymentMethodId === "string"
    ? notification.metadata.platformPaymentMethodId
    : null;
}

export async function getUserPrivateBankInfo(
  userId: string,
  currency?: string | null,
): Promise<PrivateBankMethod | null> {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      OR: [
        {
          key: {
            startsWith: "investment-order-bank-info-ready:",
          },
        },
        {
          key: {
            startsWith: "savings-funding-bank-info-request-ack:",
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      metadata: true,
    },
  });

  const readyNotificationIds = notifications
    .filter((notification) => {
      const kind = getNotificationKind(notification);
      return (
        kind === INVESTMENT_ORDER_BANK_INFO_READY_KIND ||
        kind === SAVINGS_FUNDING_BANK_INFO_REQUEST_ACK_KIND
      );
    })
    .map((notification) => getPlatformPaymentMethodId(notification))
    .filter((id): id is string => Boolean(id));

  if (readyNotificationIds.length === 0) {
    return null;
  }

  const currencyFilter = currency ? [{ currency }, { currency: null }] : undefined;

  const paymentMethods = await prisma.platformPaymentMethod.findMany({
    where: {
      id: {
        in: readyNotificationIds,
      },
      isActive: true,
      isPrivate: true,
      type: "BANK_INFO",
      ...(currencyFilter ? { OR: currencyFilter } : {}),
    },
    select: {
      id: true,
      label: true,
      type: true,
      providerName: true,
      bankName: true,
      bankCode: true,
      accountName: true,
      reference: true,
      bankAddress: true,
      accountNumber: true,
      iban: true,
      swiftCode: true,
      routingNumber: true,
      branchName: true,
      country: true,
      instructions: true,
      notes: true,
      isPrivate: true,
      isActive: true,
      isDefault: true,
      sortOrder: true,
      verificationStatus: true,
      cryptoAsset: true,
      cryptoNetwork: true,
      walletAddress: true,
      walletTag: true,
      currency: true,
    },
  });

  const paymentMethodById = new Map(
    paymentMethods.map((paymentMethod) => [paymentMethod.id, paymentMethod]),
  );

  for (const platformPaymentMethodId of readyNotificationIds) {
    const paymentMethod = paymentMethodById.get(platformPaymentMethodId);

    if (paymentMethod) {
      return paymentMethod;
    }
  }

  return null;
}
