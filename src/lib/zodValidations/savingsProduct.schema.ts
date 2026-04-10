import { z } from "zod";

export const savingsProductSchema = z
  .object({
    name: z.string().min(3, "Name is required"),
    description: z.string().optional(),

    interestEnabled: z.boolean(),

    interestRatePercent: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : null)),

    interestPayoutFrequency: z
      .union([z.enum(["DAILY", "WEEKLY", "MONTHLY"]), z.literal("")])
      .transform((val) => (val === "" ? undefined : val))
      .optional(),

    isLockable: z.boolean(),
    minimumLockDays: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : null)),
    maximumLockDays: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : null)),

    allowsWithdrawals: z.boolean(),
    allowsDeposits: z.boolean(),

    minBalance: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : null)),
    maxBalance: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : null)),

    currency: z.string().default("USD"),
    isActive: z.boolean().default(true),
    sortOrder: z.string().default("0"),
  })
  .refine(
    (data) => {
      if (data.interestEnabled) {
        return data.interestRatePercent !== null;
      }
      return true;
    },
    {
      message: "Interest rate required when interest is enabled",
      path: ["interestRatePercent"],
    },
  )
  .refine(
    (data) => {
      if (data.isLockable) {
        return data.minimumLockDays !== null;
      }
      return true;
    },
    {
      message: "Minimum lock days required when lock is enabled",
      path: ["minimumLockDays"],
    },
  )
  .refine(
    (data) => {
      if (
        data.minBalance &&
        data.maxBalance &&
        data.minBalance > data.maxBalance
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Min balance cannot exceed max balance",
      path: ["maxBalance"],
    },
  );

export type SavingsProductSchemaType = z.infer<typeof savingsProductSchema>;
