"use server";

import { getSavingsPageData } from "@/actions/savings/getSavingsPageData";

export async function getSavingsProducts() {
  const data = await getSavingsPageData();
  return data.products;
}
