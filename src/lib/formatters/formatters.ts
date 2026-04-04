const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function formatUsd(amount: number) {
  return usdFormatter.format(amount);
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateLabel(
  value: Date | string | null | undefined,
  fallback = "Not available",
) {
  if (!value) return fallback;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatEnumLabel(
  value: string | null | undefined,
  fallback = "Not available",
) {
  if (!value) return fallback;

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatTierLevel(
  value: string | null | undefined,
  fallback = "Not available",
) {
  return formatEnumLabel(value, fallback);
}
