"use server";

import { prisma } from "@/lib/prisma";

export async function getSavingsProducts() {
  const products = await prisma.savingsProduct.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return products.map((p) => ({
    ...p,
    interestRatePercent: p.interestRatePercent
      ? Number(p.interestRatePercent)
      : null,
    minBalance: p.minBalance ? Number(p.minBalance) : null,
    maxBalance: p.maxBalance ? Number(p.maxBalance) : null,
  }));
}
