import { notFound } from "next/navigation";

import InvestmentOrderPaymentClient from "../../user/investment-orders/[investmentOrderId]/payment/_components/InvestmentOrderPaymentClient";
import { getInvestmentOrderPaymentDetails } from "../../user/investment-orders/[investmentOrderId]/payment/_lib/getInvestmentOrderPaymentDetails";
import SavingsFunding from "./SavingsFunding";
import WithdrawalCommissionFunding from "./WithdrawalCommissionFunding";
import WithdrawalFeeFunding from "./WithdrawalFeeFunding";
import { getWithdrawalCommissionCheckoutDetails } from "../_lib/getWithdrawalCommissionCheckoutDetails";
import { getWithdrawalFeeCheckoutDetails } from "../_lib/getWithdrawalFeeCheckoutDetails";
import { calculateInvestmentOrderBankChargeAmount } from "@/lib/payments/bank/calculateInvestmentOrderBankChargeAmount";
import {
  getInvestmentOrderUpgradeSettings,
  getInvestmentOrderCapitalUpdateSettings,
  hasInvestmentOrderCapitalUpdateOffer,
  hasInvestmentOrderUpgradeOffer,
} from "@/lib/investment/investmentOrderUpgrade";
import {
  isCheckoutFundingMethodType,
  isCheckoutPaymentMode,
  type CheckoutFundingMethodType,
  type CheckoutPaymentMode,
} from "@/lib/types/payments/checkout.types";

type CheckoutTargetType =
  | "INVESTMENT_ORDER"
  | "SAVINGS_FUNDING"
  | "WITHDRAWAL_ORDER"
  | "WITHDRAWAL_FEE";

type InvestmentOrderPaymentFlow = "UPGRADE" | "CAPITAL_UPDATE";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type CheckoutRouteInput = {
  targetType: CheckoutTargetType;
  targetId: string;
  fundingMethodType: CheckoutFundingMethodType | null;
  paymentMode: CheckoutPaymentMode | null;
  suggestedAmount: number | null;
  paymentFlow: InvestmentOrderPaymentFlow | null;
};

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseCheckoutPaymentMode(
  value: string | string[] | undefined,
): CheckoutPaymentMode | null {
  const paymentMode = single(value);

  if (isCheckoutPaymentMode(paymentMode)) {
    return paymentMode;
  }

  return null;
}

function parseCheckoutFundingMethodType(
  value: string | string[] | undefined,
): CheckoutFundingMethodType | null {
  const fundingMethodType = single(value);

  if (isCheckoutFundingMethodType(fundingMethodType)) {
    return fundingMethodType;
  }

  return null;
}

function parseInvestmentOrderPaymentFlow(
  value: string | string[] | undefined,
): InvestmentOrderPaymentFlow | null {
  const paymentFlow = single(value);

  if (paymentFlow === "UPGRADE" || paymentFlow === "CAPITAL_UPDATE") {
    return paymentFlow;
  }

  return null;
}

function parsePositiveAmount(
  value: string | string[] | undefined,
): number | null {
  const raw = single(value);

  if (raw === undefined || raw.trim().length === 0) {
    return null;
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseCheckoutRouteInput(
  searchParams: Record<string, string | string[] | undefined>,
): CheckoutRouteInput | null {
  const targetType = single(searchParams.targetType);

  if (
    targetType === "INVESTMENT_ORDER" ||
    targetType === "SAVINGS_FUNDING" ||
    targetType === "WITHDRAWAL_ORDER" ||
    targetType === "WITHDRAWAL_FEE"
  ) {
    const targetId = single(searchParams.targetId);
    const paymentMode = parseCheckoutPaymentMode(searchParams.paymentMode);
    const fundingMethodType = parseCheckoutFundingMethodType(
      searchParams.fundingMethodType,
    );
    const suggestedAmount = parsePositiveAmount(searchParams.suggestedAmount);
    const paymentFlow = parseInvestmentOrderPaymentFlow(
      searchParams.paymentFlow,
    );

    if (!targetId) {
      return null;
    }

    if (
      targetType !== "WITHDRAWAL_ORDER" &&
      searchParams.paymentMode !== undefined &&
      paymentMode === null
    ) {
      return null;
    }

    if (
      searchParams.fundingMethodType !== undefined &&
      fundingMethodType === null
    ) {
      return null;
    }

    // Investment-order offer flows are only valid for investment orders.
    if (paymentFlow !== null && targetType !== "INVESTMENT_ORDER") {
      return null;
    }

    // Reject an explicitly supplied but invalid payment flow.
    if (
      searchParams.paymentFlow !== undefined &&
      targetType === "INVESTMENT_ORDER" &&
      paymentFlow === null
    ) {
      return null;
    }

    return {
      targetType,
      targetId,
      fundingMethodType,
      paymentMode: targetType === "WITHDRAWAL_ORDER" ? null : paymentMode,
      suggestedAmount:
        targetType === "WITHDRAWAL_ORDER" || targetType === "WITHDRAWAL_FEE"
          ? suggestedAmount
          : null,
      paymentFlow: targetType === "INVESTMENT_ORDER" ? paymentFlow : null,
    };
  }

  return null;
}

export default async function CheckoutPageView({ searchParams }: PageProps) {
  const params = await searchParams;
  const routeInput = parseCheckoutRouteInput(params);

  if (!routeInput) {
    notFound();
  }

  switch (routeInput.targetType) {
    case "INVESTMENT_ORDER": {
      const order = await getInvestmentOrderPaymentDetails(
        routeInput.targetId,
        routeInput.fundingMethodType,
      );

      const upgradeSettings = getInvestmentOrderUpgradeSettings(order);
      const capitalUpdateSettings =
        getInvestmentOrderCapitalUpdateSettings(order);

      const hasUpgradeOffer = hasInvestmentOrderUpgradeOffer(
        order.runtimeStatus,
        order,
      );

      const hasCapitalUpdateOffer = hasInvestmentOrderCapitalUpdateOffer(
        order.runtimeStatus,
        order,
      );

      /*
       * When an offer flow is explicitly supplied, honor that selection.
       * For legacy checkout links without paymentFlow, retain the previous
       * availability-based behavior.
       */
      const isUpgradeFlow =
        routeInput.paymentFlow !== null
          ? routeInput.paymentFlow === "UPGRADE" && hasUpgradeOffer
          : hasUpgradeOffer && !hasCapitalUpdateOffer;

      const isCapitalUpdateFlow =
        routeInput.paymentFlow !== null
          ? routeInput.paymentFlow === "CAPITAL_UPDATE" && hasCapitalUpdateOffer
          : hasCapitalUpdateOffer;

      /*
       * A selected offer must still be available. If an explicitly selected
       * offer is no longer available, do not silently charge for another
       * offer or fall back to the regular investment-order payment.
       */
      if (
        routeInput.paymentFlow !== null &&
        !isUpgradeFlow &&
        !isCapitalUpdateFlow
      ) {
        notFound();
      }

      const isOfferPaymentFlow = isUpgradeFlow || isCapitalUpdateFlow;

      const isInvestmentOrderSettled =
        !isOfferPaymentFlow &&
        (order.remainingAmount <= 0 ||
          order.status === "PAID" ||
          order.status === "CONFIRMED");

      const selectedFundingMethodType =
        routeInput.fundingMethodType ??
        order.paymentMethodType ??
        "BANK_TRANSFER";

      const selectedOfferAmount = isCapitalUpdateFlow
        ? capitalUpdateSettings.amount
        : isUpgradeFlow
          ? upgradeSettings.amount
          : null;

      const selectedAmount = isInvestmentOrderSettled
        ? 0
        : isOfferPaymentFlow && selectedOfferAmount !== null
          ? selectedOfferAmount
          : routeInput.paymentMode === "PARTIAL" &&
              (selectedFundingMethodType === "BANK_TRANSFER" ||
                selectedFundingMethodType === "CRYPTO_PROVIDER")
            ? calculateInvestmentOrderBankChargeAmount({
                totalAmount: order.amount,
                amountPaid: order.amountPaid,
                usePartialPayment: true,
                hasPendingSubmission: order.recentPayments.some(
                  (payment) =>
                    payment.type === "BANK_DEPOSIT" &&
                    payment.status === "PENDING_REVIEW",
                ),
              }).chargeAmount.toNumber()
            : order.remainingAmount;

      return (
        <InvestmentOrderPaymentClient
          order={order}
          selectedAmount={selectedAmount}
          isSettled={isInvestmentOrderSettled}
          fundingMethodType={routeInput.fundingMethodType}
          paymentMode={routeInput.paymentMode}
          isUpgradeFlow={isOfferPaymentFlow}
          paymentFlow={isCapitalUpdateFlow ? "CAPITAL_UPDATE" : "UPGRADE"}
        />
      );
    }

    case "SAVINGS_FUNDING":
      return (
        <SavingsFunding
          savingsAccountId={routeInput.targetId}
          fundingMethodType={routeInput.fundingMethodType}
          paymentMode={routeInput.paymentMode}
        />
      );

    case "WITHDRAWAL_ORDER": {
      const details = await getWithdrawalCommissionCheckoutDetails(
        routeInput.targetId,
        routeInput.fundingMethodType,
      );

      if (!details) {
        notFound();
      }

      return (
        <WithdrawalCommissionFunding
          details={details}
          fundingMethodType={routeInput.fundingMethodType}
          suggestedAmount={routeInput.suggestedAmount}
        />
      );
    }

    case "WITHDRAWAL_FEE": {
      const details = await getWithdrawalFeeCheckoutDetails(
        routeInput.targetId,
        routeInput.fundingMethodType,
      );

      if (!details) {
        notFound();
      }

      return (
        <WithdrawalFeeFunding
          details={details}
          fundingMethodType={routeInput.fundingMethodType}
          suggestedAmount={routeInput.suggestedAmount}
        />
      );
    }

    default:
      notFound();
  }
}
