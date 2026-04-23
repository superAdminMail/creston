function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatNorthAmericanPhone(digits: string) {
  const normalized = digits.startsWith("1") && digits.length === 11
    ? digits.slice(1)
    : digits;

  if (normalized.length !== 10) {
    return null;
  }

  const area = normalized.slice(0, 3);
  const exchange = normalized.slice(3, 6);
  const line = normalized.slice(6);

  return `+1 (${area}) ${exchange}-${line}`;
}

function formatUkPhone(digits: string) {
  const normalized = digits.startsWith("44") && digits.length === 12
    ? digits.slice(2)
    : digits;

  if (normalized.length !== 10) {
    return null;
  }

  const area = normalized.slice(0, 3);
  const exchange = normalized.slice(3, 6);
  const line = normalized.slice(6);

  return `+44 (${area}) ${exchange}-${line}`;
}

export function formatSitePhoneNumber(value: string | null | undefined) {
  if (!value?.trim()) {
    return "";
  }

  const trimmed = value.trim();
  const digits = digitsOnly(trimmed);

  if (!digits) {
    return trimmed;
  }

  if (
    trimmed.startsWith("+1") ||
    (digits.length === 11 && digits.startsWith("1"))
  ) {
    return formatNorthAmericanPhone(digits) ?? trimmed;
  }

  if (trimmed.startsWith("+44") || (digits.length === 12 && digits.startsWith("44"))) {
    return formatUkPhone(digits) ?? trimmed;
  }

  return trimmed;
}

export function getTelHrefPhoneNumber(value: string | null | undefined) {
  if (!value?.trim()) {
    return "";
  }

  const digits = digitsOnly(value);
  if (!digits) {
    return "";
  }

  return `tel:+${digits}`;
}
