// lib/price/priceCache.ts

type PriceEntry = {
  price: number;
  updatedAt: number;
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const priceCache = new Map<string, PriceEntry>();

export function getCachedPrice(symbol: string): number | null {
  const entry = priceCache.get(symbol);

  if (!entry) return null;

  const isExpired = Date.now() - entry.updatedAt > CACHE_TTL;

  if (isExpired) {
    priceCache.delete(symbol);
    return null;
  }

  return entry.price;
}

export function setCachedPrice(symbol: string, price: number) {
  priceCache.set(symbol, {
    price,
    updatedAt: Date.now(),
  });
}
