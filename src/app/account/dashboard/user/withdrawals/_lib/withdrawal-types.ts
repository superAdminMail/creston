import type { AvailableWithdrawalBalanceSummary } from "@/lib/service/getAvailableWithdrawalBalance";
import type { WithdrawalSourceOption } from "@/lib/service/getAvailableWithdrawalSource";
import type { WithdrawalRequestItemDto } from "@/lib/types/withdrawalRequests";

export type PaymentMethod = {
  id: string;
  type: "BANK" | "CRYPTO";
  bankName?: string | null;
  accountNumber?: string | null;
  network?: string | null;
  address?: string | null;
};

export type WithdrawalsClientProps = {
  kycStatus: string;
  paymentMethods: PaymentMethod[];
  withdrawalSources: WithdrawalSourceOption[];
  withdrawalOrders: WithdrawalRequestItemDto[];
  availableBalance: AvailableWithdrawalBalanceSummary;
};

export type WithdrawalPreviewDraft = {
  amount: string;
  methodId: string;
};

export type WithdrawalSourceSelection = {
  allocationMode: "AUTO" | "SINGLE";
  sourceType: WithdrawalSourceOption["type"] | null;
  sourceId: string | null;
};

export type WithdrawalPreviewAllocation = {
  savingsPortion: number;
  investmentPortion: number;
};
