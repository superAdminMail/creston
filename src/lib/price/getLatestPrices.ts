import { getLatestPersistedPrice } from "@/lib/services/price/priceService";

export async function getLatestPrices(symbols: string[]) {
  const normalizedSymbols = Array.from(
    new Set(symbols.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean)),
  );

  const latestPrices = await Promise.all(
    normalizedSymbols.map(async (symbol) => {
      const persisted = await getLatestPersistedPrice(symbol);
      return [symbol, persisted ? persisted.price.toNumber() : null] as const;
    }),
  );

  return Object.fromEntries(latestPrices) as Record<string, number | null>;
}
