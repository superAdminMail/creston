"use server";
import { getLoginAccountAccessStateByEmail } from "@/lib/auth/accountAccessState";

export type LoginAccountAccessStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "DEACTIVATED"
  | "DELETED";

export async function inspectLoginAccountAccessStateAction(
  email: string,
): Promise<{ status: LoginAccountAccessStatus } | null> {
  if (typeof email !== "string") {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (
    normalizedEmail.length === 0 ||
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    return null;
  }

  const account = await getLoginAccountAccessStateByEmail(normalizedEmail);

  if (!account) {
    return null;
  }

  switch (account.status) {
    case "DELETED":
      return { status: "DELETED" };

    case "DEACTIVATED":
      return { status: "DEACTIVATED" };

    case "SUSPENDED":
      return { status: "SUSPENDED" };

    case "ACTIVE":
      return { status: "ACTIVE" };

    default:
      return null;
  }
}
