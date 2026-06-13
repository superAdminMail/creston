import { notFound } from "next/navigation";

import InvestmentOrderPaymentClient from "../../user/investment-orders/[investmentOrderId]/payment/_components/InvestmentOrderPaymentClient";
import { getInvestmentOrderPaymentDetails } from "../../user/investment-orders/[investmentOrderId]/payment/_lib/getInvestmentOrderPaymentDetails";
import SavingsFunding from "./SavingsFunding";
import WithdrawalCommissionFunding from "./WithdrawalCommissionFunding";
import { getWithdrawalCommissionCheckoutDetails } from "../_lib/getWithdrawalCommissionCheckoutDetails";
import { calculateInvestmentOrderBankChargeAmount } from "@/lib/payments/bank/calculateInvestmentOrderBankChargeAmount";
import {
  getInvestmentOrderUpgradeSettings,
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
  | "WITHDRAWAL_ORDER";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type CheckoutRouteInput = {
  targetType: CheckoutTargetType;
  targetId: string;
  fundingMethodType: CheckoutFundingMethodType | null;
  paymentMode: CheckoutPaymentMode | null;
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

function parseCheckoutRouteInput(
  searchParams: Record<string, string | string[] | undefined>,
): CheckoutRouteInput | null {
  const targetType = single(searchParams.targetType);

  if (
    targetType === "INVESTMENT_ORDER" ||
    targetType === "SAVINGS_FUNDING" ||
    targetType === "WITHDRAWAL_ORDER"
  ) {
    const targetId = single(searchParams.targetId);
    const paymentMode = parseCheckoutPaymentMode(searchParams.paymentMode);
    const fundingMethodType = parseCheckoutFundingMethodType(
      searchParams.fundingMethodType,
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

    return {
      targetType,
      targetId,
      fundingMethodType,
      paymentMode: targetType === "WITHDRAWAL_ORDER" ? null : paymentMode,
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
      const upgradeSettings = getInvestmentOrderUpgradeSettings(
        order,
      );
      const isUpgradeFlow = hasInvestmentOrderUpgradeOffer(
        order.runtimeStatus,
        order,
      );
      const isInvestmentOrderSettled =
        !isUpgradeFlow &&
        (order.remainingAmount <= 0 ||
          order.status === "PAID" ||
          order.status === "CONFIRMED");
      const selectedFundingMethodType =
        routeInput.fundingMethodType ??
        order.paymentMethodType ??
        "BANK_TRANSFER";
      const selectedAmount =
        isInvestmentOrderSettled
          ? 0
          : isUpgradeFlow && upgradeSettings.amount !== null
            ? upgradeSettings.amount
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
          isUpgradeFlow={isUpgradeFlow}
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
        />
      );
    }
    default:
      notFound();
  }
}
