import { prisma } from "@/lib/prisma";

import {
  resolvePrivateBankMethodById,
  type PrivateBankMethod,
} from "./privateBankMethod";

export type InvestmentOrderBankInfoState = {
  status: "NONE" | "REQUESTED" | "READY";
  bankMethod: PrivateBankMethod | null;
};

type InvestmentOrderBankInfoSnapshot = {
  id: string;
  currency: string;
  bankInfoRequestedAt: Date | null;
  bankInfoRespondedAt: Date | null;
  platformPaymentMethodId: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown, key: string) {
  if (!isRecord(value)) {
    return null;
  }

  return typeof value[key] === "string" ? value[key] : null;
}

async function resolveLegacyInvestmentOrderBankInfoState(
  orderId: string,
  requesterId: string,
  currency: string,
): Promise<InvestmentOrderBankInfoState> {
  const readyNotification = await prisma.notification.findFirst({
    where: {
      userId: requesterId,
      key: `investment-order-bank-info-ready:${orderId}`,
    },
    select: {
      metadata: true,
    },
  });

  const readyPaymentMethodId = getString(
    readyNotification?.metadata,
    "platformPaymentMethodId",
  );

  if (readyPaymentMethodId) {
    const bankMethod = await resolvePrivateBankMethodById(
      readyPaymentMethodId,
      currency,
    );

    if (bankMethod) {
      return {
        status: "READY",
        bankMethod,
      };
    }

    return {
      status: "NONE",
      bankMethod: null,
    };
  }

  const requestNotification = await prisma.notification.findFirst({
    where: {
      userId: requesterId,
      key: `investment-order-bank-info-request-ack:${orderId}:${requesterId}`,
    },
    select: {
      id: true,
      metadata: true,
    },
  });

  if (requestNotification) {
    return {
      status: "REQUESTED",
      bankMethod: null,
    };
  }

  return {
    status: "NONE",
    bankMethod: null,
  };
}

export async function resolveInvestmentOrderBankInfoState(
  order: InvestmentOrderBankInfoSnapshot,
  requesterId: string,
): Promise<InvestmentOrderBankInfoState> {
  if (order.platformPaymentMethodId) {
    const bankMethod = await resolvePrivateBankMethodById(
      order.platformPaymentMethodId,
      order.currency,
    );

    if (bankMethod) {
      return {
        status: "READY",
        bankMethod,
      };
    }

    return {
      status: "NONE",
      bankMethod: null,
    };
  }

  if (order.bankInfoRequestedAt && !order.bankInfoRespondedAt) {
    return {
      status: "REQUESTED",
      bankMethod: null,
    };
  }

  if (order.bankInfoRequestedAt || order.bankInfoRespondedAt) {
    return {
      status: "NONE",
      bankMethod: null,
    };
  }

  return resolveLegacyInvestmentOrderBankInfoState(
    order.id,
    requesterId,
    order.currency,
  );
}
