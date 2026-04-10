import { prisma } from "@/lib/prisma";

export async function getLatestPrices(symbols: string[]) {
  const records = await prisma.investmentPrice.findMany({
    where: {
      symbol: { in: symbols },
      isLatest: true,
    },
  });

  return Object.fromEntries(
    records.map((r) => [r.symbol, Number(r.price)]),
  ) as Record<string, number>;
}
