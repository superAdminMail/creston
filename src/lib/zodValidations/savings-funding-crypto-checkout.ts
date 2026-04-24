import { z } from "zod";

export const createSavingsFundingCryptoCheckoutSchema = z.object({
  savingsAccountId: z.string().min(1),
  paymentMode: z.literal("FULL"),
});

