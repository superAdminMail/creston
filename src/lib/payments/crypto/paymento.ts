import crypto from "crypto";

const PAYMENTO_API_BASE_URL =
  process.env.PAYMENTO_API_BASE_URL ?? "https://api.paymento.io/v1";

const PAYMENTO_GATEWAY_URL =
  process.env.PAYMENTO_GATEWAY_URL ?? "https://app.paymento.io/gateway";

const PAYMENTO_API_KEY = process.env.PAYMENTO_API_KEY;
const PAYMENTO_SECRET_KEY = process.env.PAYMENTO_SECRET_KEY;

if (!PAYMENTO_API_KEY) {
  throw new Error("Missing PAYMENTO_API_KEY");
}

if (!PAYMENTO_SECRET_KEY) {
  throw new Error("Missing PAYMENTO_SECRET_KEY");
}

export type PaymentoAdditionalDataItem = {
  key: string;
  value: string;
};

export type PaymentoCreatePaymentPayload = {
  fiatAmount?: string;
  fiatCurrency?: string;
  ReturnUrl?: string;
  orderId?: string;
  Speed: 0 | 1;
  cryptoAmount?: Array<{
    coinName: string;
    amount: string;
  }>;
  additionalData?: PaymentoAdditionalDataItem[];
  EmailAddress?: string;
};

export type PaymentoCreatePaymentResponse = {
  success?: boolean;
  message?: string;
  body?: string;
  error?: string;
};

export type PaymentoVerifyPaymentResponse = {
  success?: boolean;
  message?: string;
  body?: {
    token?: string;
    orderId?: string;
    additionalData?: PaymentoAdditionalDataItem[];
    [key: string]: unknown;
  };
  error?: string;
};

export type PaymentoCallbackBody = {
  Token?: string;
  PaymentId?: string;
  OrderId?: string;
  OrderStatus?: string | number;
  AdditionalData?: PaymentoAdditionalDataItem[] | string | null;
  [key: string]: unknown;
};

export function parsePaymentoAdditionalData(
  value: PaymentoCallbackBody["AdditionalData"],
) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as PaymentoAdditionalDataItem[]) : [];
    } catch {
      return [];
    }
  }

  return [];
}

export function getPaymentoAdditionalDataValue(
  additionalData: PaymentoAdditionalDataItem[],
  key: string,
) {
  const match = additionalData.find((item) => item.key === key);

  if (!match) {
    return null;
  }

  const value = match.value?.trim();
  return value ? value : null;
}

export async function paymentoCreatePayment(
  payload: PaymentoCreatePaymentPayload,
) {
  const response = await fetch(`${PAYMENTO_API_BASE_URL}/payment/request`, {
    method: "POST",
    headers: {
      "Api-key": PAYMENTO_API_KEY!,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = (await response
    .json()
    .catch(() => null)) as PaymentoCreatePaymentResponse | null;

  if (!response.ok || !data?.success || !data?.body) {
    throw new Error(
      data?.error || data?.message || "Failed to create Paymento payment",
    );
  }

  const token = String(data.body).trim();

  return {
    token,
    gatewayUrl: `${PAYMENTO_GATEWAY_URL}?token=${encodeURIComponent(token)}`,
    raw: data,
  };
}

export async function paymentoVerifyPayment(token: string) {
  const response = await fetch(`${PAYMENTO_API_BASE_URL}/payment/verify`, {
    method: "POST",
    headers: {
      "Api-key": PAYMENTO_API_KEY!,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ token }),
    cache: "no-store",
  });

  const data = (await response
    .json()
    .catch(() => null)) as PaymentoVerifyPaymentResponse | null;

  if (!response.ok || !data) {
    throw new Error(
      data?.error || data?.message || "Failed to verify Paymento payment",
    );
  }

  return data;
}

export function getPaymentoSignature(headers: Headers) {
  return (
    headers.get("x-hmac-sha256-signature") ||
    headers.get("X-HMAC-SHA256-SIGNATURE") ||
    headers.get("x-paymento-signature") ||
    headers.get("x-signature")
  );
}

export function verifyPaymentoSignature(rawBody: string, signature: string) {
  const expected = crypto
    .createHmac("sha256", PAYMENTO_SECRET_KEY!)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    );
  } catch {
    return false;
  }
}

