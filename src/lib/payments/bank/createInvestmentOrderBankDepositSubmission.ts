import {
  Prisma,
  InvestmentOrderPaymentStatus,
  InvestmentOrderPaymentType,
  InvestmentOrderStatus,
  PlatformPaymentMethodType,
  UserRole,
} from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { upsertBankDepositSubmissionNotifications } from "@/lib/payments/bank/bankDepositSubmissionNotifications";
import { getUserPrivateBankInfo } from "@/lib/payments/bank/getUserPrivateBankInfo";
import { calculateInvestmentOrderBankChargeAmount } from "./calculateInvestmentOrderBankChargeAmount";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";

type CreateInvestmentOrderBankDepositSubmissionInput = {
  investmentOrderId: string;
  userId: string;
  platformPaymentMethodId?: string | null;
  proofMode?: CheckoutFundingMethodType;
  claimedAmount?: number;
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
  platformPaymentMethodId,
  proofMode = "BANK_TRANSFER",
  claimedAmount,
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

  const privateBankMethod =
    proofMode === "CRYPTO_PROVIDER"
      ? null
      : await getUserPrivateBankInfo(userId, order.currency);
  const selectedPlatformPaymentMethodId =
    platformPaymentMethodId?.trim() ||
    order.platformPaymentMethodId ||
    privateBankMethod?.id ||
    null;

  if (!selectedPlatformPaymentMethodId) {
    throw new Error("No payment method is configured for this order");
  }

  const allowPrivateMethod =
    proofMode !== "CRYPTO_PROVIDER" &&
    (selectedPlatformPaymentMethodId === order.platformPaymentMethodId ||
      selectedPlatformPaymentMethodId === privateBankMethod?.id);

  const platformPaymentMethod = await prisma.platformPaymentMethod.findFirst({
    where: {
      id: selectedPlatformPaymentMethodId,
      isActive: true,
      type:
        proofMode === "CRYPTO_PROVIDER"
          ? PlatformPaymentMethodType.WALLET_ADDRESS
          : PlatformPaymentMethodType.BANK_INFO,
      OR: allowPrivateMethod
        ? [
            {
              isPrivate: false,
              OR: [{ currency: order.currency }, { currency: null }],
            },
            {
              isPrivate: true,
              OR: [{ currency: order.currency }, { currency: null }],
            },
          ]
        : [
            {
              isPrivate: false,
              OR: [{ currency: order.currency }, { currency: null }],
            },
          ],
    },
    select: {
      id: true,
      label: true,
      type: true,
      isPrivate: true,
      currency: true,
    },
  });

  if (!platformPaymentMethod) {
    throw new Error("Selected payment method is not available");
  }

  const admins = await prisma.user.findMany({
    where: {
      isDeleted: false,
      role: {
        in: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      },
    },
    select: {
      id: true,
    },
  });

  const chargeCalculation =
    proofMode === "CRYPTO_PROVIDER"
      ? null
      : calculateInvestmentOrderBankChargeAmount({
          totalAmount: order.amount,
          amountPaid: order.amountPaid,
          usePartialPayment,
          hasPendingSubmission: false,
        });

  const paymentMode =
    proofMode === "CRYPTO_PROVIDER"
      ? "FULL"
      : chargeCalculation!.isPartialPayment
        ? "PARTIAL"
        : "FULL";

  const submittedClaimedAmount =
    proofMode === "CRYPTO_PROVIDER"
      ? new Prisma.Decimal(claimedAmount ?? 0)
      : chargeCalculation!.chargeAmount;

  if (proofMode === "CRYPTO_PROVIDER") {
    const remainingAmount = new Prisma.Decimal(order.amount).minus(
      order.amountPaid,
    );

    if (!claimedAmount || claimedAmount <= 0) {
      throw new Error("Claim amount is required");
    }

    if (new Prisma.Decimal(claimedAmount).gt(remainingAmount)) {
      throw new Error("Claim amount cannot exceed the remaining order amount");
    }
  }

  const payment = await prisma.$transaction(async (tx) => {
    const pendingPayment = await tx.investmentOrderPayment.findFirst({
      where: {
        investmentOrderId: order.id,
        status: InvestmentOrderPaymentStatus.PENDING_REVIEW,
        type: {
          in: [
            InvestmentOrderPaymentType.BANK_DEPOSIT,
            InvestmentOrderPaymentType.CRYPTO_PROVIDER,
          ],
        },
      },
      select: {
        id: true,
      },
    });

    if (pendingPayment) {
      throw new Error(
        "There is already a pending payment submission for this order",
      );
    }

    const createdPayment = await tx.investmentOrderPayment.create({
      data: {
        investmentOrderId: order.id,
        type:
          proofMode === "CRYPTO_PROVIDER"
            ? InvestmentOrderPaymentType.CRYPTO_PROVIDER
            : InvestmentOrderPaymentType.BANK_DEPOSIT,
        status: InvestmentOrderPaymentStatus.PENDING_REVIEW,
        platformPaymentMethodId: platformPaymentMethod.id,
        submittedByUserId: userId,
        claimedAmount: submittedClaimedAmount,
        currency: order.currency,
        depositorName: depositorName?.trim() || null,
        depositorAccountName: depositorAccountName?.trim() || null,
        depositorAccountNo: depositorAccountNo?.trim() || null,
        transferReference: transferReference?.trim() || null,
        receiptFileId: receiptFileId?.trim() || null,
        note: note?.trim() || null,
        metadata: {
          paymentMode,
          proofMode,
          splitNumber: chargeCalculation?.splitNumber ?? null,
          remainingBeforeCharge:
            chargeCalculation?.remainingBeforeCharge.toString() ?? null,
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
          provider: proofMode,
          paymentId: createdPayment.id,
          paymentMode,
          proofMode,
          splitNumber: chargeCalculation?.splitNumber ?? null,
          remainingBeforeCharge:
            chargeCalculation?.remainingBeforeCharge.toString() ?? null,
        },
      },
    });

    await upsertBankDepositSubmissionNotifications(
      tx,
      admins.map((admin) => ({
        key: `investment-order-bank-deposit-submitted:${createdPayment.id}:${admin.id}`,
        userId: admin.id,
        title: "Investment payment proof submitted",
        message: `A payment proof was submitted for investment order ${order.id} (${order.investmentPlan.name}) in ${order.currency}.`,
        link: `/account/dashboard/admin/investment-payments/${createdPayment.id}`,
        metadata: {
          kind: "INVESTMENT_ORDER_BANK_DEPOSIT_SUBMITTED",
          orderId: order.id,
          paymentId: createdPayment.id,
          submittedByUserId: userId,
          investmentPlanName: order.investmentPlan.name,
          currency: order.currency,
        },
      })),
    );

    return createdPayment;
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
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
