import { prisma } from "@/lib/prisma";

type RequestToken = {
  channel: "investment" | "savings";
  id: string;
  requesterId: string;
};

function parseAckToken(key: string): RequestToken | null {
  const investmentAckMatch = key.match(
    /^investment-order-bank-info-request-ack:([^:]+):([^:]+)$/,
  );

  if (investmentAckMatch) {
    return {
      channel: "investment",
      id: investmentAckMatch[1],
      requesterId: investmentAckMatch[2],
    };
  }

  const investmentRequestMatch = key.match(
    /^investment-order-bank-info-request:([^:]+):([^:]+)$/,
  );

  if (investmentRequestMatch) {
    return {
      channel: "investment",
      id: investmentRequestMatch[1],
      requesterId: investmentRequestMatch[2],
    };
  }

  const savingsAckMatch = key.match(
    /^savings-funding-bank-info-request-ack:([^:]+):([^:]+)$/,
  );

  if (savingsAckMatch) {
    return {
      channel: "savings",
      id: savingsAckMatch[1],
      requesterId: savingsAckMatch[2],
    };
  }

  const savingsRequestMatch = key.match(
    /^savings-funding-bank-info-request:([^:]+):([^:]+)$/,
  );

  if (savingsRequestMatch) {
    return {
      channel: "savings",
      id: savingsRequestMatch[1],
      requesterId: savingsRequestMatch[2],
    };
  }

  return null;
}

function parseRequestKey(key: string):
  | Omit<RequestToken, "requesterId">
  | null {
  const investmentRequestMatch = key.match(
    /^investment-order-bank-info-request:([^:]+):([^:]+)$/,
  );

  if (investmentRequestMatch) {
    return {
      channel: "investment",
      id: investmentRequestMatch[1],
    };
  }

  const savingsRequestMatch = key.match(
    /^savings-funding-bank-info-request:([^:]+):([^:]+)$/,
  );

  if (savingsRequestMatch) {
    return {
      channel: "savings",
      id: savingsRequestMatch[1],
    };
  }

  return null;
}

function buildRequestKey(
  channel: RequestToken["channel"],
  id: string,
  requesterId: string,
) {
  return `${channel}:${id}:${requesterId}`;
}

export async function hasUserBankInfoRequest(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: {
      OR: [
        {
          key: {
            startsWith: "investment-order-bank-info-request-ack:",
          },
        },
        {
          key: {
            startsWith: "savings-funding-bank-info-request-ack:",
          },
        },
        {
          key: {
            startsWith: "investment-order-bank-info-request:",
          },
        },
        {
          key: {
            startsWith: "savings-funding-bank-info-request:",
          },
        },
      ],
    },
    select: {
      id: true,
      key: true,
      metadata: true,
      userId: true,
    },
  });

  const activeRequestTokens = new Set<string>();
  const ackTokens = new Set<string>();

  for (const notification of notifications) {
    if (
      notification.key?.startsWith("investment-order-bank-info-request-ack:") ||
      notification.key?.startsWith("savings-funding-bank-info-request-ack:")
    ) {
      const token = parseAckToken(notification.key);

      if (token && notification.userId === userId && token.requesterId === userId) {
        ackTokens.add(buildRequestKey(token.channel, token.id, token.requesterId));
      }

      continue;
    }

    if (
      notification.key?.startsWith("investment-order-bank-info-request:") ||
      notification.key?.startsWith("savings-funding-bank-info-request:")
    ) {
      const token = parseRequestKey(notification.key);

      if (token && typeof notification.metadata === "object" && notification.metadata) {
        const requesterId =
          "requesterId" in notification.metadata &&
          typeof notification.metadata.requesterId === "string"
            ? notification.metadata.requesterId
            : null;

        if (requesterId === userId) {
          activeRequestTokens.add(
            buildRequestKey(token.channel, token.id, requesterId),
          );
        }
      }
    }
  }

  for (const token of ackTokens) {
    if (activeRequestTokens.has(token)) {
      return true;
    }
  }

  return false;
}
