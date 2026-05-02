"use server";

import {
  CryptoAsset,
  CryptoFundingIntentStatus,
  CryptoFundingProvider,
  CryptoNetwork,
  type InvestmentOrderStatus,
} from "@/generated/prisma";
import {
  formatCurrency,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/services/investment/decimal";

type DecimalLike = {
  toNumber(): number;
  toFixed(precision?: number): string;
};

function formatDateTimeLabel(value: Date | string | null | undefined) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatCryptoAmount(value: DecimalLike | null | undefined) {
  if (!value) return "0.00000000";

  return value.toFixed(8);
}

function formatReference(value: string | null | undefined) {
  if (!value) return "—";

  if (value.length <= 24) {
    return value;
  }

  return `${value.slice(0, 10)}...${value.slice(-10)}`;
}

export type SuperAdminFundingIntentListItem = {
  id: string;
  userName: string;
  userEmail: string;
  provider: CryptoFundingProvider;
  providerLabel: string;
  asset: CryptoAsset;
  assetLabel: string;
  network: CryptoNetwork;
  networkLabel: string;
  fiatCurrency: string;
  fiatAmount: number;
  fiatAmountLabel: string;
  expectedCryptoAmountLabel: string;
  receivedCryptoAmountLabel: string | null;
  creditedFiatAmountLabel: string | null;
  creditedFiatAmount: number | null;
  status: CryptoFundingIntentStatus;
  statusLabel: string;
  destinationLabel: string;
  destinationReference: string | null;
  providerReference: string | null;
  providerSessionId: string | null;
  providerExternalId: string | null;
  redirectUrl: string | null;
  createdAtLabel: string;
  fundedAtLabel: string | null;
  failedAtLabel: string | null;
  canceledAtLabel: string | null;
  investmentOrderId: string;
  investmentOrderStatus: InvestmentOrderStatus;
  investmentOrderStatusLabel: string;
  investmentOrderAmountLabel: string;
  investmentOrderAmountPaidLabel: string;
  investmentOrderAmount: number;
  investmentOrderAmountPaid: number;
  investmentOrderPaymentMethodTypeLabel: string;
};

export type SuperAdminFundingIntentsPageData = {
  totalIntentsCount: number;
  fundedIntentsCount: number;
  processingIntentsCount: number;
  exceptionIntentsCount: number;
  intents: SuperAdminFundingIntentListItem[];
};

export async function getSuperAdminFundingIntents(): Promise<SuperAdminFundingIntentsPageData> {
  await requireSuperAdminAccess();

  const intents = await prisma.cryptoFundingIntent.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      provider: true,
      asset: true,
      network: true,
      fiatCurrency: true,
      fiatAmount: true,
      expectedCryptoAmount: true,
      receivedCryptoAmount: true,
      creditedFiatAmount: true,
      status: true,
      destinationLabel: true,
      destinationReference: true,
      providerReference: true,
      providerSessionId: true,
      providerExternalId: true,
      redirectUrl: true,
      createdAt: true,
      fundedAt: true,
      failedAt: true,
      canceledAt: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      investmentOrder: {
        select: {
          id: true,
          status: true,
          amount: true,
          amountPaid: true,
          currency: true,
          paymentMethodType: true,
        },
      },
    },
  });

  const mappedIntents = intents.map((intent) => ({
    id: intent.id,
    userName: intent.user.name?.trim() || "Unnamed investor",
    userEmail: intent.user.email,
    provider: intent.provider,
    providerLabel: formatEnumLabel(intent.provider),
    asset: intent.asset,
    assetLabel: intent.asset,
    network: intent.network,
    networkLabel: intent.network,
    fiatCurrency: intent.fiatCurrency,
    fiatAmount: decimalToNumber(intent.fiatAmount),
    fiatAmountLabel: formatCurrency(
      decimalToNumber(intent.fiatAmount),
      intent.fiatCurrency,
    ),
    expectedCryptoAmountLabel: `${formatCryptoAmount(intent.expectedCryptoAmount)} ${intent.asset}`,
    receivedCryptoAmountLabel: intent.receivedCryptoAmount
      ? `${formatCryptoAmount(intent.receivedCryptoAmount)} ${intent.asset}`
      : null,
    creditedFiatAmountLabel: intent.creditedFiatAmount
      ? formatCurrency(decimalToNumber(intent.creditedFiatAmount), intent.fiatCurrency)
      : null,
    creditedFiatAmount: intent.creditedFiatAmount
      ? decimalToNumber(intent.creditedFiatAmount)
      : null,
    status: intent.status,
    statusLabel: formatEnumLabel(intent.status),
    destinationLabel: intent.destinationLabel?.trim() || "Destination not recorded",
    destinationReference: formatReference(intent.destinationReference),
    providerReference: formatReference(intent.providerReference),
    providerSessionId: formatReference(intent.providerSessionId),
    providerExternalId: formatReference(intent.providerExternalId),
    redirectUrl: intent.redirectUrl?.trim() || null,
    createdAtLabel: formatDateTimeLabel(intent.createdAt),
    fundedAtLabel: formatDateTimeLabel(intent.fundedAt),
    failedAtLabel: formatDateTimeLabel(intent.failedAt),
    canceledAtLabel: formatDateTimeLabel(intent.canceledAt),
    investmentOrderId: intent.investmentOrder.id,
    investmentOrderStatus: intent.investmentOrder.status,
    investmentOrderStatusLabel: formatEnumLabel(intent.investmentOrder.status),
    investmentOrderAmountLabel: formatCurrency(
      decimalToNumber(intent.investmentOrder.amount),
      intent.investmentOrder.currency,
    ),
    investmentOrderAmount: decimalToNumber(intent.investmentOrder.amount),
    investmentOrderAmountPaidLabel: formatCurrency(
      decimalToNumber(intent.investmentOrder.amountPaid),
      intent.investmentOrder.currency,
    ),
    investmentOrderAmountPaid: decimalToNumber(intent.investmentOrder.amountPaid),
    investmentOrderPaymentMethodTypeLabel: intent.investmentOrder.paymentMethodType
      ? formatEnumLabel(intent.investmentOrder.paymentMethodType)
      : "Not set",
  }));

  return {
    totalIntentsCount: mappedIntents.length,
    fundedIntentsCount: mappedIntents.filter(
      (intent) => intent.status === CryptoFundingIntentStatus.FUNDED,
    ).length,
    processingIntentsCount: mappedIntents.filter((intent) =>
      [
        CryptoFundingIntentStatus.PENDING,
        CryptoFundingIntentStatus.REQUIRES_ACTION,
        CryptoFundingIntentStatus.PROCESSING,
        CryptoFundingIntentStatus.AWAITING_PROVIDER_CONFIRMATION,
      ].some((status) => status === intent.status),
    ).length,
    exceptionIntentsCount: mappedIntents.filter((intent) =>
      [
        CryptoFundingIntentStatus.FAILED,
        CryptoFundingIntentStatus.EXPIRED,
        CryptoFundingIntentStatus.CANCELED,
      ].some((status) => status === intent.status),
    ).length,
    intents: mappedIntents,
  };
}
