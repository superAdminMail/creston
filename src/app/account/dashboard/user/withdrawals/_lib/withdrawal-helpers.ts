import type {
  PaymentMethod,
  WithdrawalPreviewAllocation,
  WithdrawalSourceSelection,
} from "./withdrawal-types";
import type { AvailableWithdrawalBalanceSummary } from "@/lib/service/getAvailableWithdrawalBalance";
import type { WithdrawalSourceOption } from "@/lib/service/getAvailableWithdrawalSource";
import { calculateWithdrawalEarlyFeePreview } from "@/lib/services/investment/withdrawalPenalty";

export function mask(value?: string | null) {
  if (!value) return "";
  return `**** ${value.slice(-4)}`;
}

export function maskWalletAddress(value?: string | null) {
  if (!value) return "Not provided";

  if (value.length <= 14) {
    return value;
  }

  return `${value.slice(0, 7)}...${value.slice(-7)}`;
}

export function getPaymentMethodLabel(method: PaymentMethod) {
  if (method.type === "BANK") {
    return `${method.bankName ?? "Bank transfer"} ${mask(method.accountNumber)}`;
  }

  return `${method.network ?? "Crypto wallet"} ${mask(method.address)}`;
}

export function resolveWithdrawalPreviewAllocation(
  requestedAmount: number,
  selection: WithdrawalSourceSelection,
  savingsBalance: number,
  investmentOrders: AvailableWithdrawalBalanceSummary["investmentOrders"],
): WithdrawalPreviewAllocation {
  if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
    return {
      savingsPortion: 0,
      investmentPortion: 0,
    };
  }

  if (selection.allocationMode === "AUTO" || !selection.sourceType) {
    const preview = calculateWithdrawalEarlyFeePreview({
      requestedAmount,
      savingsBalance,
      investmentOrders,
    });

    return {
      savingsPortion: preview.savingsPortion,
      investmentPortion: preview.investmentPortion,
    };
  }

  if (selection.sourceType === "SAVINGS_POOL") {
    return {
      savingsPortion: requestedAmount,
      investmentPortion: 0,
    };
  }

  if (selection.sourceType === "INVESTMENT_POOL") {
    return {
      savingsPortion: 0,
      investmentPortion: requestedAmount,
    };
  }

  return {
    savingsPortion: 0,
    investmentPortion: 0,
  };
}

export function getDefaultWithdrawalSourceSelection(
  withdrawalSources: WithdrawalSourceOption[],
  requestedAmount?: number,
): WithdrawalSourceSelection {
  const savingsSource =
    withdrawalSources.find((source) => source.type === "SAVINGS_POOL") ?? null;

  const investmentSource =
    withdrawalSources.find((source) => source.type === "INVESTMENT_POOL") ??
    null;

  const normalizedRequestedAmount = requestedAmount ?? 0;
  const hasRequestedAmount =
    Number.isFinite(normalizedRequestedAmount) && normalizedRequestedAmount > 0;

  if (hasRequestedAmount) {
    if (
      savingsSource &&
      investmentSource &&
      normalizedRequestedAmount > savingsSource.amount
    ) {
      return {
        allocationMode: "AUTO",
        sourceType: null,
        sourceId: null,
      };
    }

    if (savingsSource && normalizedRequestedAmount <= savingsSource.amount) {
      return {
        allocationMode: "SINGLE",
        sourceType: "SAVINGS_POOL",
        sourceId: savingsSource.id,
      };
    }

    if (investmentSource) {
      return {
        allocationMode: "SINGLE",
        sourceType: "INVESTMENT_POOL",
        sourceId: investmentSource.id,
      };
    }
  }

  if (savingsSource) {
    return {
      allocationMode: "SINGLE",
      sourceType: "SAVINGS_POOL",
      sourceId: savingsSource.id,
    };
  }

  if (investmentSource) {
    return {
      allocationMode: "SINGLE",
      sourceType: "INVESTMENT_POOL",
      sourceId: investmentSource.id,
    };
  }

  return {
    allocationMode: "AUTO",
    sourceType: null,
    sourceId: null,
  };
}

export function normalizeWithdrawalSourceSelection(
  selection: WithdrawalSourceSelection,
  withdrawalSources: WithdrawalSourceOption[],
): WithdrawalSourceSelection {
  if (!selection.sourceType || !selection.sourceId) {
    return getDefaultWithdrawalSourceSelection(withdrawalSources);
  }

  const stillAvailable = withdrawalSources.some(
    (source) =>
      source.type === selection.sourceType && source.id === selection.sourceId,
  );

  return stillAvailable
    ? selection
    : getDefaultWithdrawalSourceSelection(withdrawalSources);
}
