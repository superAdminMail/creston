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
] as const;

type TradingViewMarketChartProps = {
  tone?: "dark" | "surface";
};

export function TradingViewMarketChart({
  tone = "dark",
}: TradingViewMarketChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeSymbol, setActiveSymbol] = useState<
    (typeof MARKET_SYMBOLS)[number]["symbol"]
  >(MARKET_SYMBOLS[0].symbol);

  const active = useMemo(
    () =>
      MARKET_SYMBOLS.find((item) => item.symbol === activeSymbol) ??
      MARKET_SYMBOLS[0],
    [activeSymbol],
  );

  const isSurfaceTone = tone === "surface";

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

  const sectionClassName = [
    "relative overflow-hidden rounded-3xl shadow-sm",
    isSurfaceTone
      ? "border border-border/60 bg-white/75 text-slate-950 dark:bg-white/[0.04] dark:text-white"
      : "border border-white/10 bg-[var(--card)] text-[var(--foreground)]",
  ].join(" ");

  const headerClassName = [
    "px-5 py-5 sm:px-6",
    isSurfaceTone ? "border-b border-border/60" : "border-b border-white/10",
  ].join(" ");

  const pillClassName = [
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
    isSurfaceTone
      ? "border border-border/60 bg-white/75 text-slate-600 dark:bg-white/[0.04] dark:text-slate-300"
      : "border border-white/10 bg-white/5 text-muted-foreground",
  ].join(" ");

  const iconWrapClassName = [
    "flex h-11 w-11 items-center justify-center rounded-2xl",
    isSurfaceTone
      ? "border border-border/60 bg-white/75 dark:bg-white/[0.04]"
      : "border border-white/10 bg-white/5",
  ].join(" ");

  const titleClassName = isSurfaceTone
    ? "text-xl font-semibold text-slate-950 dark:text-white"
    : "text-xl font-semibold text-[var(--foreground)]";

  const copyClassName = isSurfaceTone
    ? "mt-1 text-sm text-slate-600 dark:text-slate-400"
    : "mt-1 text-sm text-muted-foreground";

  const nameClassName = isSurfaceTone
    ? "font-medium text-slate-950 dark:text-white"
    : "font-medium text-[var(--foreground)]";

  const tabsClassName = [
    "flex gap-2 overflow-x-auto rounded-2xl p-1",
    isSurfaceTone
      ? "border border-border/60 bg-white/75 dark:bg-white/[0.04]"
      : "border border-white/10 bg-black/10",
  ].join(" ");

  const widgetFrameClassName = [
    "overflow-hidden rounded-2xl",
    isSurfaceTone
      ? "border border-border/60 bg-white/75 dark:bg-white/[0.04]"
      : "border border-white/10 bg-black/20",
  ].join(" ");

  const copyrightClassName = [
    "tradingview-widget-copyright px-4 pb-3 pt-2 text-xs",
    isSurfaceTone ? "text-slate-600 dark:text-slate-400" : "text-muted-foreground",
  ].join(" ");

  const ActiveIcon = active.icon;

  return (
    <section className={sectionClassName}>
      <div className={headerClassName}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className={pillClassName}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Market Insight
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className={iconWrapClassName}>
                <ActiveIcon className="h-5 w-5" />
              </div>

              <div>
                <h2 className={titleClassName}>Live Market Overview</h2>
                <p className={copyClassName}>
                  Viewing{" "}
                  <span className={nameClassName}>{active.name}</span> ·{" "}
                  {active.category}
                </p>
              </div>
            </div>
          </div>

          <div className={tabsClassName}>
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
                      ? isSurfaceTone
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                        : "bg-white text-black"
                      : isSurfaceTone
                        ? "text-slate-600 hover:bg-slate-950/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
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
        <div className={widgetFrameClassName}>
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
            <div className={copyrightClassName}>
              <a
                href={`https://www.tradingview.com/symbols/${active.symbol}/?utm_source=www.tradingview.com&utm_medium=widget_new&utm_campaign=advanced-chart`}
                rel="noopener nofollow"
                target="_blank"
                className={
                  isSurfaceTone
                    ? "text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
                    : "text-blue-300 hover:text-blue-200"
                }
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
