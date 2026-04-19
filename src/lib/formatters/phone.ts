const E164_MAX_DIGITS = 15;
const COMMON_CALLING_CODES = [
  "1",
  "20",
  "27",
  "33",
  "34",
  "44",
  "49",
  "52",
  "61",
  "81",
  "91",
  "234",
  "254",
  "971",
] as const;

type NormalizePhoneInput = {
  countryCallingCode?: string | null;
  nationalNumber: string;
  country?: string | null;
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizePhoneToE164({
  countryCallingCode,
  nationalNumber,
  country,
}: NormalizePhoneInput) {
  const rawNationalNumber = nationalNumber.trim();

  if (!rawNationalNumber) {
    throw new Error("Phone number is required.");
  }

  if (rawNationalNumber.startsWith("+")) {
    const normalizedDirect = `+${digitsOnly(rawNationalNumber)}`;

    if (/^\+[1-9]\d{7,14}$/.test(normalizedDirect)) {
      return normalizedDirect;
    }
  }

  const resolvedCountryCallingCode =
    countryCallingCode?.trim() || getDefaultCountryCallingCode(country);
  const countryDigits = digitsOnly(resolvedCountryCallingCode);
  const nationalDigits = digitsOnly(rawNationalNumber).replace(/^0+/, "");

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
  value:
    | Partial<NormalizePhoneInput>
    | { countryCallingCode?: string; nationalNumber?: string; country?: string }
    | null
    | undefined,
) {
  if (!value?.nationalNumber?.trim()) {
    return true;
  }

  try {
    normalizePhoneToE164({
      countryCallingCode: value.countryCallingCode ?? "",
      nationalNumber: value.nationalNumber,
      country: value.country,
    });
    return true;
  } catch {
    return false;
  }
}

export function getDefaultCountryCallingCode(country?: string | null) {
  const normalizedCountry = country?.trim().toLowerCase();

  switch (normalizedCountry) {
    case "united states":
    case "usa":
    case "us":
    case "canada":
      return "+1";
    case "nigeria":
      return "+234";
    case "united kingdom":
    case "uk":
      return "+44";
    default:
      return "+1";
  }
}

export function splitE164PhoneNumber(
  value: string | null | undefined,
  country?: string | null,
) {
  if (!value?.trim()) {
    return {
      countryCallingCode: getDefaultCountryCallingCode(country),
      nationalNumber: "",
    };
  }

  const normalized = value.trim();
  const digits = digitsOnly(normalized);

  if (!normalized.startsWith("+") || !digits) {
    return {
      countryCallingCode: getDefaultCountryCallingCode(country),
      nationalNumber: normalized,
    };
  }

  const matchedCallingCode = [...COMMON_CALLING_CODES]
    .sort((left, right) => right.length - left.length)
    .find((code) => digits.startsWith(code));

  if (!matchedCallingCode) {
    return {
      countryCallingCode: getDefaultCountryCallingCode(country),
      nationalNumber: digits,
    };
  }

  return {
    countryCallingCode: `+${matchedCallingCode}`,
    nationalNumber: digits.slice(matchedCallingCode.length),
  };
}
