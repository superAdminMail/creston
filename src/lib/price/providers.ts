// lib/price/providers.ts

import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

type YahooQuote = {
  regularMarketPrice?: number;
};

const COINGECKO_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
};

export async function getCryptoPrice(symbol: string): Promise<number> {
  const id = COINGECKO_MAP[symbol];

  if (!id) throw new Error("Unsupported crypto symbol");

  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
    { cache: "no-store" },
  );

  const data = await res.json();

  const price = data[id]?.usd;

  if (!price) throw new Error("Invalid crypto price");

  return price;
}

export async function getMarketPrice(symbol: string): Promise<number> {
  const quote = await yahooFinance.quote(symbol);

  if (!quote?.regularMarketPrice) {
    throw new Error("Invalid market price");
  }

  return quote.regularMarketPrice;
}
