// lib/price/priceService.ts

import { prisma } from "@/lib/prisma";
import { getCryptoPrice, getMarketPrice } from "./providers";

import { getCachedPrice, setCachedPrice } from "./priceCache";

const COINGECKO_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
};

export async function getPrice(symbol: string): Promise<number> {
  // ✅ 1. Check memory cache FIRST
  const cached = getCachedPrice(symbol);
  if (cached) {
    return cached;
  }

  try {
    const price = await getLivePrice(symbol);

    if (!isValidPrice(price)) {
      throw new Error("Invalid live price");
    }

    // ✅ Save to cache
    setCachedPrice(symbol, price);

    // ✅ Save to DB
    try {
      const existing = await prisma.investmentPrice.findFirst({
        where: {
          symbol,
          isLatest: true,
        },
      });
      // ✅ skip if same price
      if (existing && Number(existing.price) === price) {
        return price;
      }

      // ✅ mark old as not latest
      if (existing) {
        await prisma.investmentPrice.update({
          where: { id: existing.id },
          data: { isLatest: false },
        });
      }

      // ✅ insert new
      await prisma.investmentPrice.create({
        data: {
          symbol,
          price,
          source: "live",
          isLatest: true,
        },
      });
    } catch (err) {
      // 🚀 THIS IS THE TRY/CATCH YOU ASKED ABOUT
      console.error("Price write failed:", symbol, err);
    }

    return price;
  } catch (error) {
    console.warn(`⚠️ Live price failed for ${symbol}`, error);

    const fallback = await getFallbackPrice(symbol);

    if (!fallback) {
      console.warn(`No fallback price for ${symbol}, using 0`);
      return 0;
    }

    if (!symbol.match(/^[A-Z0-9.-]+$/)) {
      throw new Error("Invalid symbol format");
    }

    // ✅ Cache fallback too
    setCachedPrice(symbol, fallback);

    return fallback;
  }
}

async function getLivePrice(symbol: string): Promise<number> {
  // Crypto → CoinGecko
  if (COINGECKO_MAP[symbol]) {
    return withTimeout(() => getCryptoPrice(symbol), 5000);
  }

  // Stocks / ETFs / Commodities → Yahoo
  return withTimeout(() => getMarketPrice(symbol), 5000);
}

async function getFallbackPrice(symbol: string): Promise<number | null> {
  // 1. Last known DB price
  const lastKnown = await getLastKnownPrice(symbol);
  if (lastKnown) return lastKnown;

  // 2. Static fallback (VERY RARE)
  const staticFallback = getStaticFallback(symbol);
  if (staticFallback) return staticFallback;

  return null;
}

async function getLastKnownPrice(symbol: string): Promise<number | null> {
  const latest = await prisma.investmentPrice.findFirst({
    where: { symbol },
    orderBy: { recordedAt: "desc" },
  });

  return latest ? Number(latest.price) : null;
}

function getStaticFallback(symbol: string): number | null {
  const map: Record<string, number> = {
    BTC: 60000,
    ETH: 3000,
    SPY: 500,
    VOO: 450,
    GLD: 180,
  };

  return map[symbol] ?? null;
}

function isValidPrice(price: number | null | undefined): price is number {
  return typeof price === "number" && price > 0;
}

async function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  try {
    return await fn();
  } finally {
    clearTimeout(timeout);
  }
}
