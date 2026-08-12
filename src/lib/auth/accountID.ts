import { Prisma } from "@/generated/prisma/client";
import { randomInt } from "node:crypto";

const ACCOUNT_ID_PREFIX = "ID";
const ACCOUNT_ID_LENGTH = 8;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateAccountId(): string {
  const code = Array.from(
    { length: ACCOUNT_ID_LENGTH },
    () => ALPHABET[randomInt(ALPHABET.length)],
  ).join("");

  return `${ACCOUNT_ID_PREFIX}-${code}`;
}

export async function withUniqueAccountIdRetry<T>(
  operation: (accountId: string) => Promise<T>,
  maxAttempts = 5,
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const accountId = generateAccountId();
      return await operation(accountId);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        attempt < maxAttempts - 1
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Failed to generate a unique Account ID.");
}
