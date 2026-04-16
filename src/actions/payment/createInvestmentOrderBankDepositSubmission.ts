"use server";

import { revalidatePath } from "next/cache";

import {
  createInvestmentOrderBankDepositSubmission,
  type CreateInvestmentOrderBankDepositSubmissionResult,
} from "@/lib/payments/bank/createInvestmentOrderBankDepositSubmission";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";

export type CreateInvestmentOrderBankDepositSubmissionActionResult =
  | {
      success: true;
      data: CreateInvestmentOrderBankDepositSubmissionResult;
    }
  | {
      success: false;
      error: string;
    };

type CreateInvestmentOrderBankDepositSubmissionInput = {
  investmentOrderId: string;
  usePartialPayment?: boolean;
  depositorName?: string;
  depositorAccountName?: string;
  depositorAccountNo?: string;
  transferReference?: string;
  note?: string;
  receiptFileId?: string;
};

export async function createInvestmentOrderBankDepositSubmissionAction({
  investmentOrderId,
  usePartialPayment = false,
  depositorName,
  depositorAccountName,
  depositorAccountNo,
  transferReference,
  note,
  receiptFileId,
}: CreateInvestmentOrderBankDepositSubmissionInput): Promise<CreateInvestmentOrderBankDepositSubmissionActionResult> {
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

    const data = await createInvestmentOrderBankDepositSubmission({
      investmentOrderId: normalizedInvestmentOrderId,
      userId: user.id,
      usePartialPayment,
      depositorName,
      depositorAccountName,
      depositorAccountNo,
      transferReference,
      note,
      receiptFileId,
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
    console.error(
      "createInvestmentOrderBankDepositSubmissionAction error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to submit bank deposit for this investment order",
    };
  }
}
