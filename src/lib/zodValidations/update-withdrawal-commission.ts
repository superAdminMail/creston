import { z } from "zod";

export const updateWithdrawalCommissionSchema = z
  .object({
    withdrawalId: z.string().trim().min(1, "Withdrawal order not found."),
    hasCommissionFees: z
      .union([z.literal("true"), z.literal("false")])
      .transform((value) => value === "true"),
    commissionPercent: z.string().trim().optional().or(z.literal("")),
    feeAmount: z.string().trim().optional().or(z.literal("")),
  });

export type UpdateWithdrawalCommissionFormInput = z.infer<
  typeof updateWithdrawalCommissionSchema
>;
