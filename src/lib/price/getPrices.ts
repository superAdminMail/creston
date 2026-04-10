import { getPrice } from "./priceService";

export async function getPrices(symbols: string[]) {
  const unique = [...new Set(symbols)];

  const results = await Promise.all(
    unique.map(async (symbol) => {
      try {
        const price = await getPrice(symbol);
        return { symbol, price };
      } catch {
        return { symbol, price: null };
      }
    }),
  );

  return Object.fromEntries(results.map((r) => [r.symbol, r.price])) as Record<
    string,
    number | null
  >;
}
