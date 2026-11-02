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
import { resolveInvestmentOrderBankInfoState } from "@/lib/payments/bank/investmentOrderBankInfo";
import { asJsonObject, toJsonValue } from "@/lib/payments/paymentJson";
import { calculateInvestmentOrderBankChargeAmount } from "./calculateInvestmentOrderBankChargeAmount";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";
import {
  getInvestmentOrderCapitalUpdateSettings,
  getInvestmentOrderUpgradeSettings,
  hasInvestmentOrderCapitalUpdateOffer,
  hasInvestmentOrderUpgradeOffer,
} from "@/lib/investment/investmentOrderUpgrade";

type InvestmentOrderPaymentFlow = "UPGRADE" | "CAPITAL_UPDATE";

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
  receiptFileId: string;
  isUpgradeFlow?: boolean;
  paymentFlow?: InvestmentOrderPaymentFlow;
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
  isUpgradeFlow = false,
  paymentFlow,
}: CreateInvestmentOrderBankDepositSubmissionInput): Promise<CreateInvestmentOrderBankDepositSubmissionResult> {
  const order = await prisma.investmentOrder.findFirst({
    where: {
      id: investmentOrderId,
      investorProfile: {
        userId,
      },
    },
    select: {
      id: true,
      status: true,
      runtimeStatus: true,
      amount: true,
      amountPaid: true,
      currency: true,
      investmentPlanId: true,
      bankInfoRequestedAt: true,
      bankInfoRespondedAt: true,
      upgradeStatus: true,
      upgradeAmount: true,
      upgradePaymentId: true,
      upgradeRequestedAt: true,
      upgradeReviewedAt: true,
      capitalUpdateStatus: true,
      capitalUpdateAmount: true,
      capitalUpdatePaymentId: true,
      capitalUpdateRequestedAt: true,
      capitalUpdateReviewedAt: true,
      platformPaymentMethodId: true,
      paymentMetadata: true,
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

  const hasCapitalUpdateOffer = hasInvestmentOrderCapitalUpdateOffer(
    order.runtimeStatus,
    order,
  );

  const hasUpgradeOffer = hasInvestmentOrderUpgradeOffer(
    order.runtimeStatus,
    order,
  );

  /*
   * Prefer the explicitly selected payment flow.
   *
   * For legacy callers that only provide isUpgradeFlow, retain the previous
   * behavior of selecting Capital Update when that offer is available.
   */
  const selectedPaymentFlow: InvestmentOrderPaymentFlow | null =
    paymentFlow ??
    (isUpgradeFlow
      ? hasCapitalUpdateOffer
        ? "CAPITAL_UPDATE"
        : "UPGRADE"
      : null);

  const isCapitalUpdateFlow = selectedPaymentFlow === "CAPITAL_UPDATE";
  const isUpgradeOfferFlow = selectedPaymentFlow === "UPGRADE";
  const isOfferPaymentFlow = selectedPaymentFlow !== null;

  if (isCapitalUpdateFlow && !hasCapitalUpdateOffer) {
    throw new Error("This order does not have an active capital update offer.");
  }

  if (isUpgradeOfferFlow && !hasUpgradeOffer) {
    throw new Error("This order does not have an active upgrade offer.");
  }

  if (isOfferPaymentFlow) {
    if (order.status !== InvestmentOrderStatus.CONFIRMED) {
      throw new Error(
        "Offer payments can only be submitted for a confirmed investment order",
      );
    }
  } else if (
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

  const offerSettings = isCapitalUpdateFlow
    ? getInvestmentOrderCapitalUpdateSettings(order)
    : isUpgradeOfferFlow
      ? getInvestmentOrderUpgradeSettings(order)
      : null;

  const bankInfoState =
    proofMode === "CRYPTO_PROVIDER"
      ? { status: "NONE" as const, bankMethod: null }
      : await resolveInvestmentOrderBankInfoState(
          {
            id: order.id,
            currency: order.currency,
            platformPaymentMethodId: order.platformPaymentMethodId,
            bankInfoRequestedAt: order.bankInfoRequestedAt,
            bankInfoRespondedAt: order.bankInfoRespondedAt,
          },
          userId,
        );

  const selectedPlatformPaymentMethodId =
    platformPaymentMethodId?.trim() ||
    order.platformPaymentMethod?.id ||
    bankInfoState.bankMethod?.id ||
    null;

  if (!selectedPlatformPaymentMethodId) {
    throw new Error("No payment method is configured for this order");
  }

  const normalizedReceiptFileId = receiptFileId.trim();

  if (!normalizedReceiptFileId) {
    throw new Error("Receipt image is required");
  }

  const allowPrivateMethod =
    proofMode !== "CRYPTO_PROVIDER" &&
    (selectedPlatformPaymentMethodId === order.platformPaymentMethod?.id ||
      selectedPlatformPaymentMethodId === bankInfoState.bankMethod?.id);

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
    !isOfferPaymentFlow && proofMode !== "CRYPTO_PROVIDER"
      ? calculateInvestmentOrderBankChargeAmount({
          totalAmount: order.amount,
          amountPaid: order.amountPaid,
          usePartialPayment,
          hasPendingSubmission: false,
        })
      : null;

  const paymentMode =
    isOfferPaymentFlow || proofMode === "CRYPTO_PROVIDER"
      ? "FULL"
      : chargeCalculation!.isPartialPayment
        ? "PARTIAL"
        : "FULL";

  const submittedClaimedAmount =
    isOfferPaymentFlow || proofMode === "CRYPTO_PROVIDER"
      ? new Prisma.Decimal(claimedAmount ?? 0)
      : chargeCalculation!.chargeAmount;

  if (isOfferPaymentFlow) {
    const flowLabel = isCapitalUpdateFlow ? "Capital update" : "Upgrade";

    if (claimedAmount === undefined || claimedAmount <= 0) {
      throw new Error(`${flowLabel} amount is required`);
    }

    if (offerSettings?.amount == null) {
      throw new Error(
        `This ${flowLabel.toLowerCase()} offer has no valid amount.`,
      );
    }

    if (!new Prisma.Decimal(claimedAmount).eq(offerSettings.amount)) {
      throw new Error(
        `Claim amount must match the approved ${flowLabel.toLowerCase()} amount.`,
      );
    }
  } else if (proofMode === "CRYPTO_PROVIDER") {
    const remainingAmount = new Prisma.Decimal(order.amount).minus(
      order.amountPaid,
    );

    if (claimedAmount === undefined || claimedAmount <= 0) {
      throw new Error("Claim amount is required");
    }

    if (new Prisma.Decimal(claimedAmount).gt(remainingAmount)) {
      throw new Error("Claim amount cannot exceed the remaining order amount");
    }
  }

  const payment = await prisma.$transaction(
    async (tx) => {
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
          submissionKind: isOfferPaymentFlow ? "UPGRADE" : "STANDARD",
          status: InvestmentOrderPaymentStatus.PENDING_REVIEW,
          platformPaymentMethodId: platformPaymentMethod.id,
          submittedByUserId: userId,
          claimedAmount: submittedClaimedAmount,
          currency: order.currency,
          depositorName: depositorName?.trim() || null,
          depositorAccountName: depositorAccountName?.trim() || null,
          depositorAccountNo: depositorAccountNo?.trim() || null,
          transferReference: transferReference?.trim() || null,
          receiptFileId: normalizedReceiptFileId,
          note: note?.trim() || null,
          metadata: {
            kind: isCapitalUpdateFlow
              ? "CAPITAL_UPDATE"
              : isUpgradeOfferFlow
                ? "UPGRADE"
                : "STANDARD",
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

      const now = new Date();
      const orderMetadata = asJsonObject(order.paymentMetadata);

      let nextPaymentMetadata: Prisma.InputJsonValue;

      if (isOfferPaymentFlow) {
        if (isUpgradeOfferFlow) {
          // Preserve the existing Upgrade metadata behavior.
          delete orderMetadata.upgrade;
        }

        /*
         * Do not delete orderMetadata.capitalUpdate here.
         *
         * The Capital Update offer helper checks capitalUpdate.enabled.
         * Dedicated capitalUpdate* database fields track its payment and
         * review lifecycle; preserving the metadata keeps the offer's
         * configuration and reason intact.
         */
        nextPaymentMetadata = toJsonValue(orderMetadata);
      } else {
        nextPaymentMetadata = toJsonValue({
          ...orderMetadata,
          provider: proofMode,
          paymentId: createdPayment.id,
          paymentMode,
          proofMode,
          splitNumber: chargeCalculation?.splitNumber ?? null,
          remainingBeforeCharge:
            chargeCalculation?.remainingBeforeCharge.toString() ?? null,
        });
      }

      await tx.investmentOrder.update({
        where: { id: order.id },
        data: {
          lastPaymentSubmittedAt: now,
          paymentReference: transferReference?.trim() || createdPayment.id,
          paymentMetadata: nextPaymentMetadata,

          ...(isUpgradeOfferFlow
            ? {
                upgradeStatus: "PENDING_REVIEW" as const,
                upgradeAmount: submittedClaimedAmount,
                upgradePaymentId: createdPayment.id,
                upgradeRequestedAt: now,
                upgradeReviewedAt: null,
              }
            : {}),

          ...(isCapitalUpdateFlow
            ? {
                capitalUpdateStatus: "PENDING_REVIEW" as const,
                capitalUpdateAmount: submittedClaimedAmount,
                capitalUpdatePaymentId: createdPayment.id,
                capitalUpdateRequestedAt: now,
                capitalUpdateReviewedAt: null,
              }
            : {}),
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
            kind: isOfferPaymentFlow
              ? isCapitalUpdateFlow
                ? "INVESTMENT_ORDER_CAPITAL_UPDATE_SUBMITTED"
                : "INVESTMENT_ORDER_UPGRADE_SUBMITTED"
              : "INVESTMENT_ORDER_BANK_DEPOSIT_SUBMITTED",
            orderId: order.id,
            paymentId: createdPayment.id,
            submittedByUserId: userId,
            investmentPlanName: order.investmentPlan.name,
            currency: order.currency,
            submissionKind: isOfferPaymentFlow
              ? selectedPaymentFlow
              : "STANDARD",
          },
        })),
      );

      return createdPayment;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );

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
