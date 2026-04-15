import {
  InvestmentOrderPaymentStatus,
  InvestmentOrderPaymentType,
  InvestmentOrderStatus,
  InvestmentPaymentMethodType,
  PlatformPaymentMethodType,
  Prisma,
} from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

type CreateInvestmentOrderBankDepositSubmissionInput = {
  investmentOrderId: string;
  userId: string;
  usePartialPayment?: boolean;
  depositorName?: string | null;
  depositorAccountName?: string | null;
  depositorAccountNo?: string | null;
  transferReference?: string | null;
  note?: string | null;
  receiptFileId?: string | null;
};

export type CreateInvestmentOrderBankDepositSubmissionResult = {
  paymentId: string;
  orderId: string;
  claimedAmount: string;
  currency: string;
  paymentStatus: InvestmentOrderPaymentStatus;
  orderStatus: InvestmentOrderStatus;
  platformPaymentMethodId: string;
  platformPaymentMethodLabel: string;
};

type CalculateBankChargeAmountInput = {
  totalAmount: Prisma.Decimal | string | number;
  amountPaid: Prisma.Decimal | string | number;
  usePartialPayment: boolean;
  hasPendingSubmission: boolean;
};

function calculateBankChargeAmount({
  totalAmount,
  amountPaid,
  usePartialPayment,
  hasPendingSubmission,
}: CalculateBankChargeAmountInput) {
  const total = new Prisma.Decimal(totalAmount);
  const paid = new Prisma.Decimal(amountPaid);

  if (total.lte(0)) {
    throw new Error("Investment order amount must be greater than zero");
  }

  if (paid.lt(0)) {
    throw new Error("Amount paid cannot be negative");
  }

  if (paid.gte(total)) {
    throw new Error("This investment order has already been fully paid");
  }

  if (hasPendingSubmission) {
    throw new Error(
      "There is already a pending bank payment submission for this order",
    );
  }

  const remaining = total.minus(paid);

  if (!usePartialPayment) {
    return {
      claimedAmount: remaining,
      splitNumber: null as 1 | 2 | null,
      paymentMode: "FULL" as const,
      remainingBeforeCharge: remaining,
    };
  }

  if (paid.eq(0)) {
    const half = total
      .dividedBy(2)
      .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

    if (half.lte(0)) {
      throw new Error("Unable to calculate the first partial payment amount");
    }

    return {
      claimedAmount: half,
      splitNumber: 1 as const,
      paymentMode: "PARTIAL" as const,
      remainingBeforeCharge: remaining,
    };
  }

  if (paid.gt(0) && paid.lt(total)) {
    return {
      claimedAmount: remaining,
      splitNumber: 2 as const,
      paymentMode: "PARTIAL" as const,
      remainingBeforeCharge: remaining,
    };
  }

  throw new Error("Partial payment is no longer available for this order");
}

export async function createInvestmentOrderBankDepositSubmission({
  investmentOrderId,
  userId,
  usePartialPayment = false,
  depositorName,
  depositorAccountName,
  depositorAccountNo,
  transferReference,
  note,
  receiptFileId,
}: CreateInvestmentOrderBankDepositSubmissionInput): Promise<CreateInvestmentOrderBankDepositSubmissionResult> {
  const order = await prisma.investmentOrder.findFirst({
    where: {
      id: investmentOrderId,
      investorProfile: {
        userId,
      },
    },
    include: {
      platformPaymentMethod: true,
      investmentPlan: {
        select: {
          id: true,
          name: true,
          investment: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      payments: {
        where: {
          status: InvestmentOrderPaymentStatus.PENDING_REVIEW,
          type: InvestmentOrderPaymentType.BANK_DEPOSIT,
        },
        select: {
          id: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!order) {
    throw new Error("Investment order not found");
  }

  if (
    order.status === InvestmentOrderStatus.PAID ||
    order.status === InvestmentOrderStatus.CONFIRMED
  ) {
    throw new Error("This investment order has already been paid");
  }

  if (
    order.status === InvestmentOrderStatus.CANCELLED ||
    order.status === InvestmentOrderStatus.REJECTED
  ) {
    throw new Error("This investment order can no longer be paid");
  }

  if (order.paymentMethodType !== InvestmentPaymentMethodType.BANK_TRANSFER) {
    throw new Error(
      "This investment order is not configured for bank transfer",
    );
  }

  if (!order.platformPaymentMethodId || !order.platformPaymentMethod) {
    throw new Error("No bank payment method is configured for this order");
  }

  const platformPaymentMethod = order.platformPaymentMethod;

  if (platformPaymentMethod.type !== PlatformPaymentMethodType.BANK_INFO) {
    throw new Error(
      "Selected platform payment method is not a bank payment method",
    );
  }

  if (!platformPaymentMethod.isActive) {
    throw new Error("Selected bank payment method is inactive");
  }

  const chargeCalculation = calculateBankChargeAmount({
    totalAmount: order.amount,
    amountPaid: order.amountPaid,
    usePartialPayment,
    hasPendingSubmission: Boolean(order.payments[0]),
  });

  const payment = await prisma.$transaction(async (tx) => {
    const createdPayment = await tx.investmentOrderPayment.create({
      data: {
        investmentOrderId: order.id,
        type: InvestmentOrderPaymentType.BANK_DEPOSIT,
        status: InvestmentOrderPaymentStatus.PENDING_REVIEW,
        platformPaymentMethodId: order.platformPaymentMethodId,
        submittedByUserId: userId,
        claimedAmount: chargeCalculation.claimedAmount,
        currency: order.currency,
        depositorName: depositorName?.trim() || null,
        depositorAccountName: depositorAccountName?.trim() || null,
        depositorAccountNo: depositorAccountNo?.trim() || null,
        transferReference: transferReference?.trim() || null,
        receiptFileId: receiptFileId?.trim() || null,
        note: note?.trim() || null,
        metadata: {
          paymentMode: chargeCalculation.paymentMode,
          splitNumber: chargeCalculation.splitNumber,
          remainingBeforeCharge:
            chargeCalculation.remainingBeforeCharge.toString(),
          investmentPlanId: order.investmentPlanId,
          investmentPlanName: order.investmentPlan.name,
          investmentName: order.investmentPlan.investment.name,
        },
      },
      select: {
        id: true,
        claimedAmount: true,
        currency: true,
        status: true,
      },
    });

    await tx.investmentOrder.update({
      where: { id: order.id },
      data: {
        lastPaymentSubmittedAt: new Date(),
        paymentReference: transferReference?.trim() || createdPayment.id,
        paymentMetadata: {
          provider: "BANK_TRANSFER",
          paymentId: createdPayment.id,
          paymentMode: chargeCalculation.paymentMode,
          splitNumber: chargeCalculation.splitNumber,
          remainingBeforeCharge:
            chargeCalculation.remainingBeforeCharge.toString(),
        },
      },
    });

    return createdPayment;
  });

  return {
    paymentId: payment.id,
    orderId: order.id,
    claimedAmount: payment.claimedAmount.toString(),
    currency: payment.currency,
    paymentStatus: payment.status,
    orderStatus: order.status,
    platformPaymentMethodId: platformPaymentMethod.id,
    platformPaymentMethodLabel: platformPaymentMethod.label,
  };
}
