import { prisma } from "@/lib/prisma";
import { getPrices } from "@/lib/services/price/priceService";

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

  const uniqueSymbols = Array.from(
    new Set(investments.map((investment) => investment.symbol).filter(Boolean)),
  ) as string[];

  const prices = await getPrices(uniqueSymbols);

  return {
    totalSymbols: uniqueSymbols.length,
    resolvedSymbols: Object.values(prices).filter(Boolean).length,
    prices,
  };
}
