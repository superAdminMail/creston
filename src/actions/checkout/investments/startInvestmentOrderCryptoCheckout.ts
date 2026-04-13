"use server";

import { revalidatePath } from "next/cache";

import {
  createInvestmentOrderCryptoCheckout,
  CreateInvestmentOrderCryptoCheckoutResult,
} from "@/lib/payments/crypto/createInvestmentOrderCryptoCheckout";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

export type StartInvestmentOrderCryptoCheckoutResult =
  | {
      success: true;
      data: CreateInvestmentOrderCryptoCheckoutResult;
    }
  | {
      success: false;
      error: string;
    };

type StartInvestmentOrderCryptoCheckoutInput = {
  investmentOrderId: string;
};

export async function startInvestmentOrderCryptoCheckout({
  investmentOrderId,
}: StartInvestmentOrderCryptoCheckoutInput): Promise<StartInvestmentOrderCryptoCheckoutResult> {
  try {
    const normalizedInvestmentOrderId = investmentOrderId.trim();

    if (!normalizedInvestmentOrderId) {
      return {
        success: false,
        error: "Investment order id is required",
      };
    }

    const user = await getCurrentSessionUser();

    if (!user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const data = await createInvestmentOrderCryptoCheckout({
      investmentOrderId: normalizedInvestmentOrderId,
      userId: user.id,
    });

    revalidatePath("/account/dashboard/user/investment-orders");
    revalidatePath(
      `/account/dashboard/user/investment-orders/${normalizedInvestmentOrderId}`,
    );

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("startInvestmentOrderCryptoCheckout error:", error);

    return {
      success: false,
      error: "Unable to start crypto checkout for this investment order",
    };
  }
}
