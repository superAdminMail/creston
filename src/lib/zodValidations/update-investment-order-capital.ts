import { z } from "zod";

export const updateInvestmentOrderCapitalSchema = z
  .object({
    orderId: z.string().trim().min(1),
    allowCapitalUpdate: z.enum(["true", "false"]),
    capitalUpdateReason: z.string().trim().max(500).optional(),
  })
  .superRefine((data, context) => {
    if (data.allowCapitalUpdate !== "true") {
      return;
    }

    if (!data.capitalUpdateReason?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capitalUpdateReason"],
        message: "Provide a reason for this capital update.",
      });
    }
  });
