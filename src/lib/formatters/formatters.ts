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

export function formatCompactUsd(amount: number) {
  const absoluteAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (absoluteAmount >= 1_000_000_000) {
    return `${sign}$${trimTrailingZeros(absoluteAmount / 1_000_000_000)}b`;
  }

  if (absoluteAmount >= 1_000_000) {
    return `${sign}$${trimTrailingZeros(absoluteAmount / 1_000_000)}m`;
  }

  if (absoluteAmount >= 1_000) {
    return `${sign}$${trimTrailingZeros(absoluteAmount / 1_000)}k`;
  }

  return `${sign}$${Math.round(absoluteAmount).toLocaleString("en-US")}`;
}

export function formatBytes(
  bytes: number | bigint | null | undefined,
  fallback = "0 B",
) {
  if (bytes === null || bytes === undefined) {
    return fallback;
  }

  const size =
    typeof bytes === "bigint" ? Number(bytes) : Number(bytes);

  if (!Number.isFinite(size) || size < 0) {
    return fallback;
  }

  if (size < 1024) {
    return `${Math.round(size)} B`;
  }

  const units = ["KB", "MB", "GB", "TB", "PB"];
  let value = size / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${trimTrailingZeros(value)} ${units[unitIndex]}`;
}

function trimTrailingZeros(value: number) {
  const rounded = Number(value.toFixed(1));
  return Number.isInteger(rounded) ? String(rounded) : rounded.toString();
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
