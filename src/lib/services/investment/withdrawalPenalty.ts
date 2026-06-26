export type WithdrawalPenaltyOrderInput = {
  principal: number;
  profit: number;
  currentValue: number | null;
  isMatured: boolean;
  penaltyType: "FIXED" | "PERCENT" | null;
  earlyWithdrawalPenaltyValue: number | null;
  maxPenaltyAmount: number | null;
  availableAmount?: number;
};

export type WithdrawalEarlyFeePreviewInput = {
  requestedAmount: number;
  savingsBalance: number;
  investmentOrders: WithdrawalPenaltyOrderInput[];
};

export type WithdrawalEarlyFeePreviewResult = {
  savingsPortion: number;
  investmentPortion: number;
  earlyWithdrawalFee: number;
  estimatedNetPayout: number;
  estimatedGrossDeduction: number;
  hasEarlyWithdrawal: boolean;
};

export function calculateInvestmentOrderWithdrawalPenalty(
  order: WithdrawalPenaltyOrderInput,
  grossAmount?: number,
) {
  if (order.isMatured) {
    return 0;
  }

  const penaltyType = order.penaltyType;
  const penaltyValue = order.earlyWithdrawalPenaltyValue;

  if (!penaltyType || !penaltyValue || penaltyValue <= 0) {
    return 0;
  }

  const fullGross =
    order.currentValue && order.currentValue > 0
      ? order.currentValue
      : order.principal + order.profit;

  if (fullGross <= 0) {
    return 0;
  }

  const fullPenalty =
    penaltyType === "PERCENT"
      ? (fullGross * penaltyValue) / 100
      : penaltyValue;

  if (order.maxPenaltyAmount && fullPenalty > order.maxPenaltyAmount) {
    if (grossAmount && grossAmount < fullGross) {
      return order.maxPenaltyAmount * (grossAmount / fullGross);
    }

    return order.maxPenaltyAmount;
  }

  if (!grossAmount || grossAmount >= fullGross) {
    return fullPenalty;
  }

  return fullPenalty * (grossAmount / fullGross);
}

export function calculateWithdrawalEarlyFeePreview(
  input: WithdrawalEarlyFeePreviewInput,
): WithdrawalEarlyFeePreviewResult {
  const requestedAmount = Math.max(0, input.requestedAmount);
  const savingsPortion = Math.min(requestedAmount, Math.max(0, input.savingsBalance));
  let remaining = Math.max(0, requestedAmount - savingsPortion);
  let earlyWithdrawalFee = 0;

  for (const order of input.investmentOrders) {
    if (remaining <= 0) {
      break;
    }

    const grossAmount = Math.min(remaining, Math.max(0, order.availableAmount ?? 0));

    if (grossAmount <= 0) {
      continue;
    }

    earlyWithdrawalFee += calculateInvestmentOrderWithdrawalPenalty(
      order,
      grossAmount,
    );

    remaining -= grossAmount;
  }

  return {
    savingsPortion,
    investmentPortion: Math.max(0, requestedAmount - savingsPortion),
    earlyWithdrawalFee,
    estimatedNetPayout: Math.max(0, requestedAmount - earlyWithdrawalFee),
    estimatedGrossDeduction: requestedAmount,
    hasEarlyWithdrawal: earlyWithdrawalFee > 0,
  };
}
