"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { createSavingsFundingDepositSubmission } from "@/lib/payments/bank/createSavingsFundingDepositSubmission";

const schema = z.object({
  savingsAccountId: z.string().min(1),
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

export async function submitSavingsFundingProof(input: Input) {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return { ok: false, message: "Unauthorized." };
  }

  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Invalid savings funding submission." };
  }

  try {
    const result = await createSavingsFundingDepositSubmission({
      savingsAccountId: parsed.data.savingsAccountId,
      userId: user.id,
      claimedAmount: parsed.data.claimedAmount,
      depositorName: parsed.data.depositorName,
      depositorAccountName: parsed.data.depositorAccountName,
      depositorAccountNo: parsed.data.depositorAccountNo,
      transferReference: parsed.data.transferReference,
      note: parsed.data.note,
      receiptFileId: parsed.data.receiptFileId,
      platformPaymentMethodId: parsed.data.platformPaymentMethodId,
    });

    revalidatePath("/account/dashboard/user/savings");
    revalidatePath("/account/dashboard/checkout");
    revalidatePath("/account/dashboard/admin/deposits");
    revalidatePath("/account/dashboard/super-admin/deposits");

    return {
      ok: true,
      message: "Deposit proof submitted for review.",
      data: result,
    };
  } catch (error) {
    console.error("submitSavingsFundingProof error:", error);

    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to submit deposit proof",
    };
  }
}
