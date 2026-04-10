"use server";

import { headers } from "next/headers";

import {
  ChangePasswordSchemaType,
  changePasswordSchema,
} from "@/lib/zodValidations/password";
import { auth } from "@/lib/auth";
import type { FormFieldErrors } from "@/lib/forms/actionState";

type ChangePasswordFieldName =
  | "currentPassword"
  | "newPassword"
  | "confirmPassword";

export type ChangePasswordResult = {
  success?: true;
  error?: string;
  fieldErrors?: FormFieldErrors<ChangePasswordFieldName>;
};

export async function changePassword(
  values: ChangePasswordSchemaType,
): Promise<ChangePasswordResult> {
  const parsed = changePasswordSchema.safeParse(values);

  if (!parsed.success) {
    return {
      error: "Please review the highlighted password fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword,
        newPassword,
      },
    });

    return { success: true } as const;
  } catch {
    return {
      error: "Invalid current password or unable to update password.",
      fieldErrors: {
        currentPassword: [
          "Enter your current password correctly before choosing a new one.",
        ],
      },
    } as const;
  }
}
