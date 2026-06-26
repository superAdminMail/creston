"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { getSafeServerActionErrorMessage } from "@/lib/forms/actionState";
import { createWithdrawalFeeSubmission } from "@/lib/payments/withdrawals/createWithdrawalFeeSubmission";
import { submitWithdrawalFeeProofSchema as schema } from "@/lib/zodValidations/withdrawal-fee-proof";

type Input = z.infer<typeof schema>;

export async function submitWithdrawalFeeProof(input: Input) {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return { ok: false, message: "Unauthorized." };
  }

  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Invalid withdrawal fee submission." };
  }

  try {
    const result = await createWithdrawalFeeSubmission({
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
    revalidatePath("/account/dashboard/super-admin/withdrawals");
    revalidatePath(
      `/account/dashboard/super-admin/withdrawals/${result.withdrawalId}`,
    );
    revalidatePath("/account/dashboard/notifications");

    return {
      ok: true,
      message: "Withdrawal fee proof submitted for admin review.",
      data: result,
    };
  } catch (error) {
    return {
      ok: false,
      message: getSafeServerActionErrorMessage(
        "submitWithdrawalFeeProof",
        error,
        "Unable to submit withdrawal fee proof.",
      ),
    };
  }
}
