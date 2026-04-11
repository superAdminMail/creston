"use server";

import { getSavingsPageData } from "@/actions/savings/getSavingsPageData";

export async function getUserSavingsAccounts() {
  const data = await getSavingsPageData();
  return data.accounts;
}
