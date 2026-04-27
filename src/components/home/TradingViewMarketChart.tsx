"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, BarChart3, Bitcoin, Gem, LineChart } from "lucide-react";

const MARKET_SYMBOLS = [
  {
    label: "SPY",
    name: "S&P 500 ETF",
    symbol: "AMEX:SPY",
    category: "Market benchmark",
    icon: LineChart,
  },
  {
    label: "VOO",
    name: "Vanguard S&P 500 ETF",
    symbol: "AMEX:VOO",
    category: "Index fund",
    icon: BarChart3,
  },
  {
    label: "TSLA",
    name: "Tesla Inc.",
    symbol: "NASDAQ:TSLA",
    category: "Equity",
    icon: Activity,
  },
  {
    label: "AAPL",
    name: "Apple Inc.",
    symbol: "NASDAQ:AAPL",
    category: "Equity",
    icon: Activity,
  },
  {
    label: "GLD",
    name: "Gold ETF",
    symbol: "AMEX:GLD",
    category: "Commodity ETF",
    icon: Gem,
  },
  {
    label: "BTC",
    name: "Bitcoin",
    symbol: "BINANCE:BTCUSDT",
    category: "Crypto",
    icon: Bitcoin,
  },
];

export function TradingViewMarketChart() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeSymbol, setActiveSymbol] = useState(MARKET_SYMBOLS[0].symbol);

  const active = useMemo(
    () =>
      MARKET_SYMBOLS.find((item) => item.symbol === activeSymbol) ??
      MARKET_SYMBOLS[0],
    [activeSymbol],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const widgetNode = container.querySelector(
      ".tradingview-widget-container__widget",
    ) as HTMLDivElement | null;
    const existingScript = container.querySelector(
      "script[data-tradingview-widget]",
    );

    if (existingScript) {
      existingScript.remove();
    }

    if (widgetNode) {
      widgetNode.innerHTML = "";
    }

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.dataset.tradingviewWidget = "advanced-chart";
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.text = JSON.stringify({
      autosize: true,
      width: "100%",
      height: "100%",
      symbol: active.symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: false,
      enable_publishing: false,
      hide_side_toolbar: false,
      calendar: false,
      save_image: false,
      support_host: "https://www.tradingview.com",
    });

    container.appendChild(script);

    return () => {
      script.remove();
    };
  }, [active.symbol]);

  const ActiveIcon = active.icon;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[var(--card)] shadow-sm">
      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Market Insight
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <ActiveIcon className="h-5 w-5 text-[var(--foreground)]" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)]">
                  Live Market Overview
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Viewing{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {active.name}
                  </span>{" "}
                  · {active.category}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/10 p-1">
            {MARKET_SYMBOLS.map((item) => {
              const Icon = item.icon;
              const isActive = item.symbol === active.symbol;

              return (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => setActiveSymbol(item.symbol)}
                  className={[
                    "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition",
                    isActive
                      ? "bg-white text-black"
                      : "text-muted-foreground hover:bg-white/10 hover:text-[var(--foreground)]",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-3">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          <div
            key={active.symbol}
            ref={containerRef}
            className="tradingview-widget-container w-full"
            style={{
              height: "clamp(380px, 52vw, 520px)",
              minHeight: "inherit",
              width: "100%",
            }}
          >
            <div
              className="tradingview-widget-container__widget"
              style={{
                height: "100%",
                minHeight: "inherit",
                width: "100%",
              }}
            />
            <div className="tradingview-widget-copyright px-4 pb-3 pt-2 text-xs text-muted-foreground">
              <a
                href={`https://www.tradingview.com/symbols/${active.symbol}/?utm_source=www.tradingview.com&utm_medium=widget_new&utm_campaign=advanced-chart`}
                rel="noopener nofollow"
                target="_blank"
                className="text-blue-300 hover:text-blue-200"
              >
                <span className="blue-text">{active.label} chart</span>
              </a>
              <span className="trademark"> by TradingView</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
