import { prisma } from "@/lib/prisma";

import {
  resolvePrivateBankMethodById,
  type PrivateBankMethod,
} from "./privateBankMethod";

export type SavingsAccountBankInfoState = {
  status: "NONE" | "REQUESTED" | "READY";
  bankMethod: PrivateBankMethod | null;
};

type SavingsAccountBankInfoSnapshot = {
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

async function resolveLegacySavingsAccountBankInfoState(
  savingsAccountId: string,
  requesterId: string,
  currency: string,
): Promise<SavingsAccountBankInfoState> {
  const requestNotification = await prisma.notification.findFirst({
    where: {
      userId: requesterId,
      key: `savings-funding-bank-info-request-ack:${savingsAccountId}:${requesterId}`,
    },
    select: {
      metadata: true,
    },
  });

  const paymentMethodId = getString(
    requestNotification?.metadata,
    "platformPaymentMethodId",
  );

  if (paymentMethodId) {
    const bankMethod = await resolvePrivateBankMethodById(
      paymentMethodId,
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

export async function resolveSavingsAccountBankInfoState(
  account: SavingsAccountBankInfoSnapshot,
  requesterId: string,
): Promise<SavingsAccountBankInfoState> {
  if (account.platformPaymentMethodId) {
    const bankMethod = await resolvePrivateBankMethodById(
      account.platformPaymentMethodId,
      account.currency,
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

  if (account.bankInfoRequestedAt && !account.bankInfoRespondedAt) {
    return {
      status: "REQUESTED",
      bankMethod: null,
    };
  }

  if (account.bankInfoRequestedAt || account.bankInfoRespondedAt) {
    return {
      status: "NONE",
      bankMethod: null,
    };
  }

  return resolveLegacySavingsAccountBankInfoState(
    account.id,
    requesterId,
    account.currency,
  );
}
