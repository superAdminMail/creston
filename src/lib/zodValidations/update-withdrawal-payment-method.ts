import { z } from "zod";

const baseSchema = {
  withdrawalId: z.string().trim().min(1, "Withdrawal order is required."),
};

const westernUnionSchema = z.object({
  ...baseSchema,
  methodType: z.literal("WESTERN_UNION"),
  receiverName: z.string().trim().min(1, "Enter the receiver name."),
  receiverCountry: z.string().trim().min(1, "Enter the receiver country."),
  receiverCity: z.string().trim().min(1, "Enter the receiver city."),
  receiverPhone: z.string().trim().min(1, "Enter the receiver phone number."),
  transferReference: z.string().trim().optional().or(z.literal("")),
  note: z.string().trim().optional().or(z.literal("")),
});

const cashDeliverySchema = z.object({
  ...baseSchema,
  methodType: z.literal("CASH_DELIVERY"),
  recipientName: z.string().trim().min(1, "Enter the recipient name."),
  deliveryCountry: z.string().trim().min(1, "Enter the delivery country."),
  deliveryCity: z.string().trim().min(1, "Enter the delivery city."),
  deliveryAddress: z.string().trim().min(1, "Enter the delivery address."),
  contactPhone: z.string().trim().min(1, "Enter the contact phone number."),
  deliveryInstructions: z.string().trim().optional().or(z.literal("")),
  note: z.string().trim().optional().or(z.literal("")),
});

export const updateWithdrawalPaymentMethodSchema = z.discriminatedUnion(
  "methodType",
  [westernUnionSchema, cashDeliverySchema],
);
