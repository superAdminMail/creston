const E164_MAX_DIGITS = 15;

type NormalizePhoneInput = {
  countryCallingCode: string;
  nationalNumber: string;
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizePhoneToE164({
  countryCallingCode,
  nationalNumber,
}: NormalizePhoneInput) {
  const countryDigits = digitsOnly(countryCallingCode);
  const nationalDigits = digitsOnly(nationalNumber).replace(/^0+/, "");

  if (!countryDigits) {
    throw new Error("Country calling code is required.");
  }

  if (!nationalDigits) {
    throw new Error("Phone number is required.");
  }

  const normalized = `+${countryDigits}${nationalDigits}`;

  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
    throw new Error("Phone number must be a valid E.164 number.");
  }

  if (normalized.length - 1 > E164_MAX_DIGITS) {
    throw new Error("Phone number is too long.");
  }

  return normalized;
}

export function isValidPhoneInput(
  value: Partial<NormalizePhoneInput> | null | undefined,
) {
  if (!value?.nationalNumber?.trim()) {
    return true;
  }

  try {
    normalizePhoneToE164({
      countryCallingCode: value.countryCallingCode ?? "",
      nationalNumber: value.nationalNumber,
    });
    return true;
  } catch {
    return false;
  }
}
