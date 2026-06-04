import { Prisma } from "@/generated/prisma";

import { asJsonObject, toJsonValue } from "@/lib/payments/paymentJson";
import { isInactiveInvestmentOrderRuntimeStatus } from "@/lib/investment/formatInvestmentOrderRuntimeStatusLabel";

export type InvestmentOrderUpgradeSettings = {
  allowUpgrade: boolean;
  amount: number | null;
};

function parsePositiveNumber(value: unknown): number | null {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : null;

  if (numeric === null || !Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return numeric;
}

export function getInvestmentOrderUpgradeSettings(
  paymentMetadata: unknown,
): InvestmentOrderUpgradeSettings {
  const metadata = asJsonObject(paymentMetadata);
  const upgrade = asJsonObject(metadata.upgrade);

  return {
    allowUpgrade: upgrade.allowUpgrade === true,
    amount: parsePositiveNumber(upgrade.amount),
  };
}

export function hasInvestmentOrderUpgradeOffer(
  runtimeStatus: string,
  paymentMetadata: unknown,
) {
  const settings = getInvestmentOrderUpgradeSettings(paymentMetadata);

  return (
    isInactiveInvestmentOrderRuntimeStatus(runtimeStatus) &&
    settings.allowUpgrade &&
    settings.amount !== null
  );
}

export function buildInvestmentOrderUpgradePath(orderId: string) {
  return `/account/dashboard/user/investment-orders/${orderId}/upgrade`;
}

export function setInvestmentOrderUpgradeSettings(
  paymentMetadata: unknown,
  settings: InvestmentOrderUpgradeSettings,
): Prisma.InputJsonValue {
  const metadata = asJsonObject(paymentMetadata);
  const nextMetadata: Record<string, unknown> = {
    ...metadata,
  };

  if (!settings.allowUpgrade || !settings.amount || settings.amount <= 0) {
    delete nextMetadata.upgrade;
    return toJsonValue(nextMetadata);
  }

  nextMetadata.upgrade = {
    allowUpgrade: true,
    amount: settings.amount,
  };

  return toJsonValue(nextMetadata);
}
