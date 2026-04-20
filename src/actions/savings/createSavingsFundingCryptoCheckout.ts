"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  CryptoFundingProvider,
  SavingsFundingIntentStatus,
  SavingsFundingMethodType,
  SavingsStatus,
} from "@/generated/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { getAppBaseUrl } from "@/lib/config/appUrl";
import { prisma } from "@/lib/prisma";
import { paymentoCreatePayment } from "@/lib/payments/crypto/paymento";
import { calculateSavingsFundingChargeAmount } from "@/lib/payments/savings/calculateSavingsFundingChargeAmount";

const schema = z.object({
  savingsAccountId: z.string().min(1),
  paymentMode: z.literal("FULL"),
});

type Input = z.infer<typeof schema>;

const ACTIVE_INTENT_STATUSES: SavingsFundingIntentStatus[] = [
  SavingsFundingIntentStatus.PENDING,
  SavingsFundingIntentStatus.SUBMITTED,
  SavingsFundingIntentStatus.PARTIALLY_PAID,
];

const CREDITED_INTENT_STATUSES: SavingsFundingIntentStatus[] = [
  SavingsFundingIntentStatus.PAID,
  SavingsFundingIntentStatus.CREDITED,
];

export type CreateSavingsFundingCryptoCheckoutResult =
  | {
      ok: true;
      redirectUrl: string;
      fundingIntentId: string;
      reused: boolean;
    }
  | {
      ok: false;
      message: string;
    };

export async function createSavingsFundingCryptoCheckout(
  input: Input,
): Promise<CreateSavingsFundingCryptoCheckoutResult> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return { ok: false, message: "Unauthorized." };
  }

  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Invalid savings crypto checkout request." };
  }

  const account = await prisma.savingsAccount.findFirst({
    where: {
      id: parsed.data.savingsAccountId,
      investorProfile: {
        userId: user.id,
      },
    },
    select: {
      id: true,
      balance: true,
      targetAmount: true,
      currency: true,
      status: true,
      investorProfile: {
        select: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
      savingsProduct: {
        select: {
          allowsDeposits: true,
        },
      },
      savingsFundingIntents: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          status: true,
          fundingMethodType: true,
          providerSessionId: true,
          targetAmount: true,
          creditedAmount: true,
        },
      },
    },
  });

  if (!account) {
    return { ok: false, message: "Savings account not found." };
  }

  if (account.status !== SavingsStatus.ACTIVE) {
    return {
      ok: false,
      message: "This savings account is not active.",
    };
  }

  if (!account.savingsProduct.allowsDeposits) {
    return {
      ok: false,
      message: "This savings product does not accept deposits.",
    };
  }

  const latestIntent = account.savingsFundingIntents[0] ?? null;
  const hasActiveCryptoIntent =
    latestIntent?.fundingMethodType ===
      SavingsFundingMethodType.CRYPTO_PROVIDER &&
    ACTIVE_INTENT_STATUSES.includes(latestIntent.status);

  if (hasActiveCryptoIntent) {
    return {
      ok: false,
      message:
        "There is already an active crypto payment session for this savings account.",
    };
  }

  const creditedFundingIntentTotals = await prisma.savingsFundingIntent.aggregate(
    {
      where: {
        savingsAccountId: account.id,
        status: {
          in: CREDITED_INTENT_STATUSES,
        },
      },
      _sum: {
        creditedAmount: true,
      },
    },
  );

  const amountPaid =
    creditedFundingIntentTotals._sum.creditedAmount?.toNumber() ?? 0;

  const chargeCalculation = calculateSavingsFundingChargeAmount({
    totalAmount: account.targetAmount ?? account.balance,
    amountPaid,
    fundingMethodType: "CRYPTO_PROVIDER",
    hasPendingSubmission: false,
    hasActiveCryptoIntent: false,
  });
  const paymentMode = "FULL" as const;

  const appBaseUrl = getAppBaseUrl();
  const returnUrl = new URL(
    "/account/dashboard/checkout/crypto/callback",
    appBaseUrl,
  );
  returnUrl.searchParams.set("targetType", "SAVINGS_FUNDING");
  returnUrl.searchParams.set("targetId", account.id);
  returnUrl.searchParams.set("fundingMethodType", "CRYPTO_PROVIDER");
  returnUrl.searchParams.set("paymentMode", paymentMode);
  returnUrl.searchParams.set("provider", "PAYMENTO");

  try {
    const created = await paymentoCreatePayment({
      fiatAmount: chargeCalculation.chargeAmount.toString(),
      fiatCurrency: account.currency,
      orderId: account.id,
      Speed: 1,
      ReturnUrl: returnUrl.toString(),
      additionalData: [
        { key: "savingsAccountId", value: account.id },
        {
          key: "userId",
          value: user.id,
        },
        {
          key: "paymentMode",
          value: paymentMode,
        },
        {
          key: "fundingMethodType",
          value: "CRYPTO_PROVIDER",
        },
      ],
      EmailAddress: account.investorProfile.user.email,
    });

    const intent = await prisma.savingsFundingIntent.create({
      data: {
        savingsAccountId: account.id,
        userId: user.id,
        fundingMethodType: SavingsFundingMethodType.CRYPTO_PROVIDER,
        status: SavingsFundingIntentStatus.SUBMITTED,
        provider: CryptoFundingProvider.PAYMENTO,
        providerSessionId: created.token,
        providerReference: created.token,
        providerExternalId: created.token,
        paymentReference: created.token,
        currency: account.currency,
        targetAmount: chargeCalculation.chargeAmount,
        creditedAmount: 0,
        submittedAt: new Date(),
        metadata: {
          createPaymentResponse: created.raw,
          paymentMode,
          chargeAmount: chargeCalculation.chargeAmount.toString(),
          remainingBeforeCharge:
            chargeCalculation.remainingBeforeCharge.toString(),
          splitNumber: chargeCalculation.splitNumber,
          source: "savings_checkout",
        },
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/account/dashboard/checkout");
    revalidatePath("/account/dashboard/user/savings");

    return {
      ok: true,
      redirectUrl: created.gatewayUrl,
      fundingIntentId: intent.id,
      reused: false,
    };
  } catch (error) {
    console.error("[createSavingsFundingCryptoCheckout]", error);

    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to create crypto checkout.",
    };
  }
}
