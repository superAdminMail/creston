import { getPrices as getPriceSnapshots } from "@/lib/services/price/priceService";

export async function getPrices(symbols: string[]) {
  const snapshots = await getPriceSnapshots(symbols);

  return Object.fromEntries(
    Object.entries(snapshots).map(([symbol, snapshot]) => [symbol, snapshot.price]),
  ) as Record<string, number | null>;
}
