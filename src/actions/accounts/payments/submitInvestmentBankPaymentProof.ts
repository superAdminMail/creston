"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

const schema = z.object({
  orderId: z.string().min(1),
  platformPaymentMethodId: z.string().min(1),
  claimedAmount: z.number().positive(),
  depositorName: z.string().trim().max(120).optional(),
  depositorAccountName: z.string().trim().max(120).optional(),
  depositorAccountNo: z.string().trim().max(80).optional(),
  transferReference: z.string().trim().max(120).optional(),
  note: z.string().trim().max(500).optional(),
  receiptFileId: z.string().trim().max(100).optional(),
});

type Input = z.infer<typeof schema>;

export async function submitInvestmentBankPaymentProof(input: Input) {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return { ok: false, message: "Unauthorized." };
  }

  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Invalid payment submission." };
  }

  const data = parsed.data;

  const order = await prisma.investmentOrder.findFirst({
    where: {
      id: data.orderId,
      investorProfile: {
        userId: user.id,
      },
    },
    select: {
      id: true,
      status: true,
      currency: true,
      amount: true,
      amountPaid: true,
      platformPaymentMethodId: true,
    },
  });

  if (!order) {
    return { ok: false, message: "Investment order not found." };
  }

  if (!["PENDING_PAYMENT", "PARTIALLY_PAID"].includes(order.status)) {
    return {
      ok: false,
      message: "This order is no longer accepting payment submissions.",
    };
  }

  const remainingAmount = Math.max(
    order.amount.toNumber() - order.amountPaid.toNumber(),
    0,
  );

  if (data.claimedAmount > remainingAmount) {
    return {
      ok: false,
      message: "Claimed amount cannot be greater than the remaining balance.",
    };
  }

  const paymentMethod = await prisma.platformPaymentMethod.findFirst({
    where: {
      id: data.platformPaymentMethodId,
      isActive: true,
      type: "BANK_INFO",
      ...(order.platformPaymentMethodId
        ? {
            id: order.platformPaymentMethodId,
          }
        : {
            isPrivate: false,
          }),
    },
    select: {
      id: true,
    },
  });

  if (!paymentMethod) {
    return {
      ok: false,
      message: "Selected bank transfer method is not available.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.investmentOrderPayment.create({
      data: {
        investmentOrderId: order.id,
        type: "BANK_DEPOSIT",
        status: "PENDING_REVIEW",
        platformPaymentMethodId: data.platformPaymentMethodId,
        submittedByUserId: user.id,
        claimedAmount: data.claimedAmount,
        currency: order.currency,
        depositorName: data.depositorName || null,
        depositorAccountName: data.depositorAccountName || null,
        depositorAccountNo: data.depositorAccountNo || null,
        transferReference: data.transferReference || null,
        note: data.note || null,
        receiptFileId: data.receiptFileId || null,
      },
    });

    await tx.investmentOrder.update({
      where: { id: order.id },
      data: {
        paymentMethodType: "BANK_TRANSFER",
        platformPaymentMethodId: data.platformPaymentMethodId,
        lastPaymentSubmittedAt: new Date(),
      },
    });
  });

  revalidatePath(
    `/account/dashboard/user/investment-orders/${order.id}/payment`,
  );

  return {
    ok: true,
    message: "Payment proof submitted for admin review.",
  };
}
