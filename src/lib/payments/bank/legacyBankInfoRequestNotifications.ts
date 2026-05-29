import type { Prisma, PrismaClient } from "@/generated/prisma";

export type LegacyBankInfoRequestChannel = "investment" | "savings";
export type LegacyBankInfoRequestKind = "request" | "ack";

export type LegacyBankInfoRequestToken = {
  channel: LegacyBankInfoRequestChannel;
  kind: LegacyBankInfoRequestKind;
  targetId: string;
  requesterId: string;
};

export type LegacyBankInfoRequestNotification = {
  id: string;
  channel: LegacyBankInfoRequestChannel;
  targetId: string;
  requesterId: string;
};

export type LegacyBankInfoRequestScanResult = {
  liveAckNotifications: LegacyBankInfoRequestNotification[];
  orphanAckNotifications: LegacyBankInfoRequestNotification[];
  affectedInvestmentOrderIds: string[];
  affectedSavingsAccountIds: string[];
  revalidatePaths: string[];
};

const LEGACY_BANK_INFO_REQUEST_PREFIXES = [
  "investment-order-bank-info-request:",
  "investment-order-bank-info-request-ack:",
  "savings-funding-bank-info-request:",
  "savings-funding-bank-info-request-ack:",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getMetadataRequesterId(metadata: unknown) {
  if (!isRecord(metadata)) {
    return null;
  }

  return typeof metadata.requesterId === "string"
    ? metadata.requesterId
    : null;
}

export function parseLegacyBankInfoRequestKey(
  key: string,
): LegacyBankInfoRequestToken | null {
  const match = key.match(
    /^(investment-order-bank-info-request|investment-order-bank-info-request-ack|savings-funding-bank-info-request|savings-funding-bank-info-request-ack):([^:]+):([^:]+)$/,
  );

  if (!match) {
    return null;
  }

  const prefix = match[1];
  const targetId = match[2];
  const requesterId = match[3];

  return {
    channel: prefix.startsWith("investment") ? "investment" : "savings",
    kind: prefix.endsWith("-ack") ? "ack" : "request",
    targetId,
    requesterId,
  };
}

export function getLegacyBankInfoRequestMatchKey({
  channel,
  targetId,
  requesterId,
}: Pick<LegacyBankInfoRequestToken, "channel" | "targetId" | "requesterId">) {
  return `${channel}:${targetId}:${requesterId}`;
}

export async function scanLegacyBankInfoRequestNotifications(
  db: PrismaClient | Prisma.TransactionClient,
  options?: {
    requesterId?: string | null;
  },
): Promise<LegacyBankInfoRequestScanResult> {
  const notifications = await db.notification.findMany({
    where: {
      OR: LEGACY_BANK_INFO_REQUEST_PREFIXES.map((prefix) => ({
        key: {
          startsWith: prefix,
        },
      })),
    },
    select: {
      id: true,
      key: true,
      metadata: true,
    },
  });

  const liveRequestKeys = new Set<string>();
  const ackNotifications: LegacyBankInfoRequestNotification[] = [];

  for (const notification of notifications) {
    if (!notification.key) {
      continue;
    }

    const token = parseLegacyBankInfoRequestKey(notification.key);

    if (!token) {
      continue;
    }

    if (token.kind === "request") {
      const requesterId = getMetadataRequesterId(notification.metadata);

      if (requesterId) {
        liveRequestKeys.add(
          getLegacyBankInfoRequestMatchKey({
            channel: token.channel,
            targetId: token.targetId,
            requesterId,
          }),
        );
      }

      continue;
    }

    if (options?.requesterId && token.requesterId !== options.requesterId) {
      continue;
    }

    ackNotifications.push({
      id: notification.id,
      channel: token.channel,
      targetId: token.targetId,
      requesterId: token.requesterId,
    });
  }

  const liveAckNotifications = ackNotifications.filter((notification) =>
    liveRequestKeys.has(
      getLegacyBankInfoRequestMatchKey({
        channel: notification.channel,
        targetId: notification.targetId,
        requesterId: notification.requesterId,
      }),
    ),
  );

  const orphanAckNotifications = ackNotifications.filter(
    (notification) =>
      !liveRequestKeys.has(
        getLegacyBankInfoRequestMatchKey({
          channel: notification.channel,
          targetId: notification.targetId,
          requesterId: notification.requesterId,
        }),
      ),
  );

  const affectedInvestmentOrderIds = Array.from(
    new Set(
      orphanAckNotifications
        .filter((notification) => notification.channel === "investment")
        .map((notification) => notification.targetId),
    ),
  );
  const affectedSavingsAccountIds = Array.from(
    new Set(
      orphanAckNotifications
        .filter((notification) => notification.channel === "savings")
        .map((notification) => notification.targetId),
    ),
  );

  const revalidatePaths = new Set<string>([
    "/account/dashboard/notifications",
    "/account/dashboard/checkout",
  ]);

  for (const notification of orphanAckNotifications) {
    if (notification.channel === "investment") {
      revalidatePaths.add(
        `/account/dashboard/user/investment-orders/${notification.targetId}/payment`,
      );
    }
  }

  return {
    liveAckNotifications,
    orphanAckNotifications,
    affectedInvestmentOrderIds,
    affectedSavingsAccountIds,
    revalidatePaths: Array.from(revalidatePaths),
  };
}
