"use server";

import { getLoginAccountAccessStateByEmail } from "@/lib/auth/accountAccessState";

export async function inspectLoginAccountAccessStateAction(email: string) {
  return getLoginAccountAccessStateByEmail(email);
}
