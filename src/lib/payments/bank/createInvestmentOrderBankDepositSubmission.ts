import {
  InvestmentOrderPaymentStatus,
  InvestmentOrderPaymentType,
  InvestmentOrderStatus,
  InvestmentPaymentMethodType,
  PlatformPaymentMethodType,
} from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { calculateInvestmentOrderBankChargeAmount } from "./calculateInvestmentOrderBankChargeAmount";

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

  const chargeCalculation = calculateInvestmentOrderBankChargeAmount({
    totalAmount: order.amount,
    amountPaid: order.amountPaid,
    usePartialPayment,
    hasPendingSubmission: Boolean(order.payments[0]),
  });

  const paymentMode = chargeCalculation.isPartialPayment ? "PARTIAL" : "FULL";

  const payment = await prisma.$transaction(async (tx) => {
    const createdPayment = await tx.investmentOrderPayment.create({
      data: {
        investmentOrderId: order.id,
        type: InvestmentOrderPaymentType.BANK_DEPOSIT,
        status: InvestmentOrderPaymentStatus.PENDING_REVIEW,
        platformPaymentMethodId: order.platformPaymentMethodId,
        submittedByUserId: userId,
        claimedAmount: chargeCalculation.chargeAmount,
        currency: order.currency,
        depositorName: depositorName?.trim() || null,
        depositorAccountName: depositorAccountName?.trim() || null,
        depositorAccountNo: depositorAccountNo?.trim() || null,
        transferReference: transferReference?.trim() || null,
        receiptFileId: receiptFileId?.trim() || null,
        note: note?.trim() || null,
        metadata: {
          paymentMode,
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
          paymentMode,
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
