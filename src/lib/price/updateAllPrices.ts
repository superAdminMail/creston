// lib/price/updateAllPrices.ts

import { prisma } from "@/lib/prisma";
import { getPrice } from "./priceService";

export async function updateAllPrices() {
  const investments = await prisma.investment.findMany({
    where: {
      symbol: { not: null },
      isActive: true,
    },
    select: {
      symbol: true,
    },
  });

  const uniqueSymbols = [
    ...new Set(investments.map((i) => i.symbol).filter(Boolean)),
  ] as string[];

  console.log("🔄 Updating prices for:", uniqueSymbols);

  for (const symbol of uniqueSymbols) {
    try {
      const price = await getPrice(symbol);
      console.log(`✅ ${symbol}: ${price}`);
    } catch (error) {
      console.error(`❌ Failed for ${symbol}`, error);
    }
  }
}
