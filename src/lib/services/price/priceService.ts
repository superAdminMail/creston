import YahooFinance from "yahoo-finance2";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/services/investment/decimal";

const yahooFinance = new YahooFinance();

const PRICE_CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8_000;
const STATIC_FALLBACK_PRICES: Record<string, number> = {
  BTC: 60_000,
  ETH: 3_000,
  SPY: 500,
  VOO: 450,
  GLD: 180,
};

const COINGECKO_SYMBOL_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
};

type MemoryPriceCacheEntry = {
  price: number;
  expiresAt: number;
};

type PersistedPriceRecord = {
  symbol: string;
  price: Prisma.Decimal;
  source: string | null;
  recordedAt: Date;
};

export type PriceLookupResult = {
  symbol: string;
  price: number;
  source: "live" | "db_fallback" | "static_fallback" | "unresolved";
  isFallback: boolean;
  recordedAt: Date | null;
};

type GetPricesOptions = {
  preferFreshDb?: boolean;
};

const memoryPriceCache = new Map<string, MemoryPriceCacheEntry>();

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function getMemoryCache(symbol: string) {
  const cacheEntry = memoryPriceCache.get(symbol);

  if (!cacheEntry) {
    return null;
  }

  if (cacheEntry.expiresAt <= Date.now()) {
    memoryPriceCache.delete(symbol);
    return null;
  }

  return cacheEntry.price;
}

function setMemoryCache(symbol: string, price: number) {
  memoryPriceCache.set(symbol, {
    price,
    expiresAt: Date.now() + PRICE_CACHE_TTL_MS,
  });
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs = REQUEST_TIMEOUT_MS) {
  let timeoutId: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Price provider timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function isValidPrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isFreshRecordedAt(recordedAt: Date) {
  return Date.now() - recordedAt.getTime() <= PRICE_CACHE_TTL_MS;
}

export async function getLatestPersistedPrices(
  symbols: string[],
): Promise<Map<string, PersistedPriceRecord>> {
  const normalizedSymbols = Array.from(new Set(symbols.map(normalizeSymbol)));

  if (normalizedSymbols.length === 0) {
    return new Map();
  }

  const rows = await prisma.investmentPrice.findMany({
    where: {
      symbol: {
        in: normalizedSymbols,
      },
      isLatest: true,
    },
    select: {
      symbol: true,
      price: true,
      source: true,
      recordedAt: true,
    },
  });

  return new Map(rows.map((row) => [row.symbol, row]));
}

async function fetchCryptoPrices(symbols: string[]) {
  const idToSymbol = new Map<string, string>();

  for (const symbol of symbols) {
    const id = COINGECKO_SYMBOL_MAP[symbol];

    if (id) {
      idToSymbol.set(id, symbol);
    }
  }

  if (idToSymbol.size === 0) {
    return new Map<string, number>();
  }

  const ids = Array.from(idToSymbol.keys());
  const url = new URL("https://api.coingecko.com/api/v3/simple/price");
  url.searchParams.set("ids", ids.join(","));
  url.searchParams.set("vs_currencies", "usd");

  const response = await withTimeout(
    fetch(url, {
      cache: "no-store",
    }),
  );

  if (!response.ok) {
    throw new Error(`CoinGecko request failed with ${response.status}`);
  }

  const payload = (await response.json()) as Record<
    string,
    {
      usd?: number;
    }
  >;

  const prices = new Map<string, number>();

  for (const [id, symbol] of idToSymbol.entries()) {
    const value = payload[id]?.usd;

    if (isValidPrice(value)) {
      prices.set(symbol, value);
    }
  }

  return prices;
}

type YahooQuote = {
  regularMarketPrice?: number | null;
};

async function fetchMarketPrices(symbols: string[]) {
  const uniqueSymbols = Array.from(new Set(symbols));

  if (uniqueSymbols.length === 0) {
    return new Map<string, number>();
  }

  const quotes = await Promise.all(
    uniqueSymbols.map(async (symbol) => {
      const quote = (await withTimeout(
        yahooFinance.quoteCombine(symbol),
      )) as YahooQuote;

      return {
        symbol,
        price: quote.regularMarketPrice ?? null,
      };
    }),
  );

  return new Map(
    quotes
      .filter((quote) => isValidPrice(quote.price))
      .map((quote) => [quote.symbol, quote.price as number]),
  );
}

async function fetchLivePrices(symbols: string[]) {
  const normalizedSymbols = Array.from(new Set(symbols.map(normalizeSymbol)));
  const cryptoSymbols = normalizedSymbols.filter(
    (symbol) => COINGECKO_SYMBOL_MAP[symbol],
  );
  const marketSymbols = normalizedSymbols.filter(
    (symbol) => !COINGECKO_SYMBOL_MAP[symbol],
  );

  const [cryptoResult, marketResult] = await Promise.allSettled([
    fetchCryptoPrices(cryptoSymbols),
    fetchMarketPrices(marketSymbols),
  ]);

  const livePrices = new Map<string, number>();

  if (cryptoResult.status === "fulfilled") {
    for (const [symbol, price] of cryptoResult.value.entries()) {
      livePrices.set(symbol, price);
    }
  } else {
    console.error("Crypto price batch failed:", cryptoResult.reason);
  }

  if (marketResult.status === "fulfilled") {
    for (const [symbol, price] of marketResult.value.entries()) {
      livePrices.set(symbol, price);
    }
  } else {
    console.error("Market price batch failed:", marketResult.reason);
  }

  return livePrices;
}

async function persistLatestPrice(symbol: string, price: number, source: string) {
  const existing = await prisma.investmentPrice.findFirst({
    where: {
      symbol,
      isLatest: true,
    },
    select: {
      id: true,
      price: true,
    },
  });

  if (existing && new Prisma.Decimal(price).equals(existing.price)) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.investmentPrice.update({
        where: {
          id: existing.id,
        },
        data: {
          isLatest: false,
        },
      });
    }

    await tx.investmentPrice.create({
      data: {
        symbol,
        price: new Prisma.Decimal(price),
        source,
        isLatest: true,
      },
    });
  });
}

export async function getPrices(
  symbols: string[],
  options: GetPricesOptions = {},
): Promise<Record<string, PriceLookupResult>> {
  const normalizedSymbols = Array.from(
    new Set(symbols.map(normalizeSymbol).filter(Boolean)),
  );

  if (normalizedSymbols.length === 0) {
    return {};
  }

  const persistedLatestBySymbol = await getLatestPersistedPrices(normalizedSymbols);
  const results = new Map<string, PriceLookupResult>();
  const symbolsNeedingLiveFetch: string[] = [];

  for (const symbol of normalizedSymbols) {
    const memoryPrice = getMemoryCache(symbol);

    if (memoryPrice !== null) {
      results.set(symbol, {
        symbol,
        price: memoryPrice,
        source: "live",
        isFallback: false,
        recordedAt: null,
      });
      continue;
    }

    const persisted = persistedLatestBySymbol.get(symbol);

    if (
      options.preferFreshDb &&
      persisted &&
      isFreshRecordedAt(persisted.recordedAt)
    ) {
      const price = decimalToNumber(persisted.price);
      setMemoryCache(symbol, price);
      results.set(symbol, {
        symbol,
        price,
        source: "db_fallback",
        isFallback: true,
        recordedAt: persisted.recordedAt,
      });
      continue;
    }

    symbolsNeedingLiveFetch.push(symbol);
  }

  const livePrices = await fetchLivePrices(symbolsNeedingLiveFetch);
  const persistenceJobs: Promise<void>[] = [];

  for (const symbol of symbolsNeedingLiveFetch) {
    const livePrice = livePrices.get(symbol);

    if (isValidPrice(livePrice)) {
      setMemoryCache(symbol, livePrice);
      results.set(symbol, {
        symbol,
        price: livePrice,
        source: "live",
        isFallback: false,
        recordedAt: new Date(),
      });
      persistenceJobs.push(persistLatestPrice(symbol, livePrice, "live"));
      continue;
    }

    const persisted = persistedLatestBySymbol.get(symbol);

    if (persisted) {
      const persistedPrice = decimalToNumber(persisted.price);
      setMemoryCache(symbol, persistedPrice);
      results.set(symbol, {
        symbol,
        price: persistedPrice,
        source: "db_fallback",
        isFallback: true,
        recordedAt: persisted.recordedAt,
      });
      continue;
    }

    const staticFallback = STATIC_FALLBACK_PRICES[symbol];

    if (isValidPrice(staticFallback)) {
      setMemoryCache(symbol, staticFallback);
      results.set(symbol, {
        symbol,
        price: staticFallback,
        source: "static_fallback",
        isFallback: true,
        recordedAt: null,
      });
      continue;
    }

    results.set(symbol, {
      symbol,
      price: 0,
      source: "unresolved",
      isFallback: true,
      recordedAt: null,
    });
  }

  await Promise.allSettled(persistenceJobs);

  return Object.fromEntries(
    normalizedSymbols.map((symbol) => {
      const result = results.get(symbol);

      if (!result) {
        throw new Error(`Price result missing for ${symbol}`);
      }

      return [symbol, result];
    }),
  );
}

export async function getPrice(
  symbol: string,
  options: GetPricesOptions = {},
): Promise<number> {
  const normalizedSymbol = normalizeSymbol(symbol);
  const prices = await getPrices([normalizedSymbol], options);
  const price = prices[normalizedSymbol].price;

  if (!isValidPrice(price)) {
    throw new Error(`Unable to resolve price for ${normalizedSymbol}`);
  }

  return price;
}

export async function getLatestPersistedPrice(symbol: string) {
  const normalizedSymbol = normalizeSymbol(symbol);
  const persistedPrices = await getLatestPersistedPrices([normalizedSymbol]);
  return persistedPrices.get(normalizedSymbol) ?? null;
}
