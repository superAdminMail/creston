import { getLatestPersistedPrices } from "@/lib/services/price/priceService";

export async function getLatestPrices(symbols: string[]) {
  const normalizedSymbols = Array.from(
    new Set(symbols.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean)),
  );

  const persistedPrices = await getLatestPersistedPrices(normalizedSymbols);
  const latestPrices = normalizedSymbols.map((symbol) => {
    const persisted = persistedPrices.get(symbol);
    return [symbol, persisted ? persisted.price.toNumber() : null] as const;
  });

  return Object.fromEntries(latestPrices) as Record<string, number | null>;
}
