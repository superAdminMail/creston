import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((val) => {
    const trimmed = val?.trim();
    return trimmed ? trimmed : null;
  });

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((val) => !val || z.string().email().safeParse(val).success, {
    message: "Enter a valid email.",
  })
  .transform((val) => {
    const trimmed = val?.trim();
    return trimmed ? trimmed : null;
  });

export const managementSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  title: optionalTrimmedString,
  role: optionalTrimmedString,
  email: optionalEmail,
  phone: optionalTrimmedString,
  bio: optionalTrimmedString,
  photoFileId: optionalTrimmedString,
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type ManagementFormInput = z.infer<typeof managementSchema>;

export const updateManagementSchema = managementSchema.extend({});

export type UpdateManagementFormInput = z.infer<typeof updateManagementSchema>;

export function normalizeManagementValues(values: ManagementFormInput) {
  return {
    name: values.name.trim(),
    title: values.title,
    role: values.role,
    email: values.email,
    phone: values.phone,
    bio: values.bio,
    photoFileId: values.photoFileId,
    isActive: values.isActive ?? true,
    sortOrder: values.sortOrder ?? 0,
  };
}
