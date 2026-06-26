"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { getSafeServerActionErrorMessage } from "@/lib/forms/actionState";
import { createWithdrawalCommissionSubmission } from "@/lib/payments/withdrawals/createWithdrawalCommissionSubmission";
import { submitWithdrawalCommissionProofSchema as schema } from "@/lib/zodValidations/withdrawal-commission-proof";

type Input = z.infer<typeof schema>;

export async function submitWithdrawalCommissionProof(input: Input) {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return { ok: false, message: "Unauthorized." };
  }

  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Invalid withdrawal commission submission." };
  }

  try {
    const result = await createWithdrawalCommissionSubmission({
      withdrawalId: parsed.data.withdrawalId,
      userId: user.id,
      claimedAmount: parsed.data.claimedAmount,
      proofMode: parsed.data.proofMode,
      depositorName: parsed.data.depositorName,
      depositorAccountName: parsed.data.depositorAccountName,
      depositorAccountNo: parsed.data.depositorAccountNo,
      transferReference: parsed.data.transferReference,
      note: parsed.data.note,
      receiptFileId: parsed.data.receiptFileId,
      platformPaymentMethodId: parsed.data.platformPaymentMethodId,
    });

    revalidatePath("/account/dashboard/user/withdrawals");
    revalidatePath(`/account/dashboard/user/withdrawals/${result.withdrawalId}`);
    revalidatePath("/account/dashboard/checkout");
    revalidatePath("/account/dashboard/admin/Withdrawals");
    revalidatePath(`/account/dashboard/admin/Withdrawals/${result.withdrawalId}`);
    revalidatePath("/account/dashboard/notifications");

    return {
      ok: true,
      message: "Withdrawal commission proof submitted for admin review.",
      data: result,
    };
  } catch (error) {
    return {
      ok: false,
      message: getSafeServerActionErrorMessage(
        "submitWithdrawalCommissionProof",
        error,
        "Unable to submit withdrawal commission proof.",
      ),
    };
  }
}
