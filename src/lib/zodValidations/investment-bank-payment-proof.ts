import { z } from "zod";

export const submitInvestmentBankPaymentProofSchema = z.object({
  orderId: z.string().min(1),
  platformPaymentMethodId: z.string().min(1),
  proofMode: z.enum(["BANK_TRANSFER", "CRYPTO_PROVIDER"]).optional(),
  claimedAmount: z.number().positive(),
  usePartialPayment: z.boolean().optional(),

  // Legacy flag retained for compatibility with existing callers.
  isUpgradeFlow: z.boolean().optional(),

  // Explicitly identifies which investment-order offer is being paid.
  paymentFlow: z.enum(["UPGRADE", "CAPITAL_UPDATE"]).optional(),

  depositorName: z.string().trim().max(120).optional(),
  depositorAccountName: z.string().trim().max(120).optional(),
  depositorAccountNo: z.string().trim().max(80).optional(),
  transferReference: z.string().trim().max(120).optional(),
  note: z.string().trim().max(500).optional(),
  receiptFileId: z.string().trim().min(1).max(100),
});
