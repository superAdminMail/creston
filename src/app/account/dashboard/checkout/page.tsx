export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import InvestmentOrderPaymentClient from "../user/investment-orders/[investmentOrderId]/payment/_components/InvestmentOrderPaymentClient";
import { getInvestmentOrderPaymentDetails } from "../user/investment-orders/[investmentOrderId]/payment/_lib/getInvestmentOrderPaymentDetails";
import SavingsFunding from "./_components/SavingsFunding";
import { calculateInvestmentOrderBankChargeAmount } from "@/lib/payments/bank/calculateInvestmentOrderBankChargeAmount";
import {
  isCheckoutFundingMethodType,
  isCheckoutPaymentMode,
  type CheckoutFundingMethodType,
  type CheckoutPaymentMode,
} from "@/lib/types/payments/checkout.types";

type CheckoutTargetType = "INVESTMENT_ORDER" | "SAVINGS_FUNDING";

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

  if (targetType === "INVESTMENT_ORDER" || targetType === "SAVINGS_FUNDING") {
    const targetId = single(searchParams.targetId);
    const paymentMode = parseCheckoutPaymentMode(searchParams.paymentMode);
    const fundingMethodType = parseCheckoutFundingMethodType(
      searchParams.fundingMethodType,
    );

    if (!targetId) {
      return null;
    }

    if (searchParams.paymentMode !== undefined && paymentMode === null) {
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
      paymentMode,
    };
  }

  return null;
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const routeInput = parseCheckoutRouteInput(params);

  if (!routeInput) {
    notFound();
  }

  switch (routeInput.targetType) {
    case "INVESTMENT_ORDER": {
      const order = await getInvestmentOrderPaymentDetails(routeInput.targetId);
      const partialPaymentAmount = calculateInvestmentOrderBankChargeAmount({
        totalAmount: order.amount,
        amountPaid: order.amountPaid,
        usePartialPayment: true,
        hasPendingSubmission: order.recentPayments.some(
          (payment) =>
            payment.type === "BANK_DEPOSIT" &&
            payment.status === "PENDING_REVIEW",
        ),
      }).chargeAmount.toNumber();

      return (
        <InvestmentOrderPaymentClient
          order={order}
          partialPaymentAmount={partialPaymentAmount}
          fundingMethodType={routeInput.fundingMethodType}
          paymentMode={routeInput.paymentMode}
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
    default:
      notFound();
  }
}
