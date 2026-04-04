const E164_PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
const NON_DIGIT_SEPARATORS_PATTERN = /[\s().-]/g;

class PhoneFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhoneFormatError";
  }
}

type SplitPhoneInput = {
  countryCode: string;
  localNumber: string;
};

type PhoneInput = string | SplitPhoneInput;

function isSplitPhoneInput(input: PhoneInput): input is SplitPhoneInput {
  return typeof input !== "string";
}

function sanitizePhoneInput(input: string) {
  return input.replace(NON_DIGIT_SEPARATORS_PATTERN, "");
}

function buildPhoneInputString(input: PhoneInput): string {
  if (!isSplitPhoneInput(input)) return input;

  const cleanCountry = input.countryCode.replace(/\D/g, "");
  const cleanLocal = input.localNumber.replace(/\D/g, "");

  if (!cleanCountry || !cleanLocal) {
    throw new PhoneFormatError(
      "Phone number must include country code and number.",
    );
  }

  const nationalNumber = cleanLocal.replace(/^0+/, "");

  if (!nationalNumber) {
    throw new PhoneFormatError("Phone number is required.");
  }

  return `+${cleanCountry}${nationalNumber}`;
}

export function normalizePhoneToE164(input: PhoneInput): string {
  const sanitized = sanitizePhoneInput(buildPhoneInputString(input));

  if (!E164_PHONE_PATTERN.test(sanitized)) {
    throw new PhoneFormatError(
      "Phone number must be a valid E.164 international number.",
    );
  }

  return sanitized;
}

export function normalizeOptionalPhoneToE164(
  phone?: string | null,
): string | null {
  if (!phone?.trim()) return null;
  return normalizePhoneToE164(phone);
}

export function splitNormalizedPhone(phone?: string | null) {
  const raw = (phone ?? "").trim();
  if (!raw) return { countryCode: "", localNumber: "" };

  const normalized = raw.startsWith("+") ? raw.slice(1) : raw;
  const digits = normalized.replace(/\D/g, "");
  if (!digits) return { countryCode: "", localNumber: "" };

  const codeLength = digits.length > 10 ? Math.min(3, digits.length - 10) : 1;

  return {
    countryCode: digits.slice(0, codeLength),
    localNumber: digits.slice(codeLength),
  };
}
