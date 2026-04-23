type CompactCurrencyProps = {
  amount: number;
  currency?: string;
  className?: string;
};

const usdCompactFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

export function formatCurrencyCompact(amount: number, currency = "USD") {
  if (currency === "USD") {
    return usdCompactFormatter.format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function CompactCurrency({
  amount,
  currency = "USD",
  className,
}: CompactCurrencyProps) {
  return <span className={className}>{formatCurrencyCompact(amount, currency)}</span>;
}
