import { z } from "zod";

export const submitInvestmentBankPaymentProofSchema = z.object({
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

