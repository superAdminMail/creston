"use server";

import { headers } from "next/headers";

import {
  ChangePasswordSchemaType,
  changePasswordSchema,
} from "@/lib/zodValidations/password";
import { auth } from "@/lib/auth";

export async function changePassword(values: ChangePasswordSchemaType) {
  const parsed = changePasswordSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Invalid password data" };
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
      error: "Invalid current password or unable to update password",
    } as const;
  }
}
