import { z } from "zod";

const decimalPattern = /^\d+(?:\.\d{1,2})?$/;

export const updateWithdrawalCommissionSchema = z
  .object({
    withdrawalId: z.string().trim().min(1, "Withdrawal order not found."),
    hasCommissionFees: z
      .union([z.literal("true"), z.literal("false")])
      .transform((value) => value === "true"),
    commissionPercent: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    if (!value.hasCommissionFees) {
      return;
    }

    if (!value.commissionPercent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["commissionPercent"],
        message: "Enter a commission percent.",
      });
      return;
    }

    if (!decimalPattern.test(value.commissionPercent)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["commissionPercent"],
        message: "Enter a valid commission percent.",
      });
      return;
    }

    const commissionPercent = Number(value.commissionPercent);

    if (commissionPercent <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["commissionPercent"],
        message: "Commission percent must be greater than zero.",
      });
      return;
    }

    if (commissionPercent > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["commissionPercent"],
        message: "Commission percent cannot exceed 100.",
      });
    }
  });

export type UpdateWithdrawalCommissionFormInput = z.infer<
  typeof updateWithdrawalCommissionSchema
>;
