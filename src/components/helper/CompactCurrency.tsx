type CompactCurrencyProps = {
  amount: number;
  currency?: string;
  className?: string;
};

export function formatCurrencyCompact(amount: number, currency = "USD") {
  const absoluteAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (absoluteAmount < 1_000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: Number.isInteger(absoluteAmount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  const currencySymbol =
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? currency;

  if (absoluteAmount >= 1_000_000_000) {
    return `${sign}${currencySymbol}${trimTrailingZeros(
      absoluteAmount / 1_000_000_000,
    )}b`;
  }

  if (absoluteAmount >= 1_000_000) {
    return `${sign}${currencySymbol}${trimTrailingZeros(
      absoluteAmount / 1_000_000,
    )}m`;
  }

  return `${sign}${currencySymbol}${trimTrailingZeros(absoluteAmount / 1_000)}k`;
}

export function CompactCurrency({
  amount,
  currency = "USD",
  className,
}: CompactCurrencyProps) {
  return <span className={className}>{formatCurrencyCompact(amount, currency)}</span>;
}

function trimTrailingZeros(value: number) {
  const rounded = Number(value.toFixed(1));
  return Number.isInteger(rounded) ? String(rounded) : rounded.toString();
}
