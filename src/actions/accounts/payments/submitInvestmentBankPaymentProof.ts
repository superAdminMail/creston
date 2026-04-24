"use server";

import { revalidatePath } from "next/cache";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { createInvestmentOrderBankDepositSubmission } from "@/lib/payments/bank/createInvestmentOrderBankDepositSubmission";
import { submitInvestmentBankPaymentProofSchema as schema } from "@/lib/zodValidations/investment-bank-payment-proof";

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
  try {
    const result = await createInvestmentOrderBankDepositSubmission({
      investmentOrderId: data.orderId,
      userId: user.id,
      platformPaymentMethodId: data.platformPaymentMethodId,
      depositorName: data.depositorName,
      depositorAccountName: data.depositorAccountName,
      depositorAccountNo: data.depositorAccountNo,
      transferReference: data.transferReference,
      note: data.note,
      receiptFileId: data.receiptFileId,
    });

    revalidatePath(
      `/account/dashboard/user/investment-orders/${result.orderId}/payment`,
    );

    return {
      ok: true,
      message: "Payment proof submitted for admin review.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to submit payment proof.",
    };
  }
}
