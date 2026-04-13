import { BitPayInvoiceStatus } from "@/generated/prisma";

type BitPayInvoiceResponseData = {
  id?: string;
  status?: string;
  price?: number | string;
  currency?: string;
  orderId?: string;
  url?: string;
  token?: string;
  posData?: string;
  exceptionStatus?: string | null;
  amountPaid?: number | string | null;
  amountDue?: number | string | null;
  rate?: number | string | null;
};

export type BitPayInvoiceCreateResult = {
  invoiceId: string;
  invoiceUrl: string;
  status: "new" | "paid" | "confirmed" | "complete" | "expired" | "invalid";
  price: string;
  currency: string;
  token?: string | null;
  orderId?: string | null;
  posData?: string | null;
  raw: unknown;
};

export type BitPayInvoiceVerificationResult = {
  invoiceId: string;
  status: string;
  price: string;
  currency: string;
  orderId?: string | null;
  invoiceUrl?: string | null;
  token?: string | null;
  posData?: string | null;
  exceptionStatus?: string | null;
  amountPaid?: string | null;
  amountDue?: string | null;
  rate?: string | null;
  raw: unknown;
};

function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export function toBitPayInvoiceStatus(
  value: string | null | undefined,
): BitPayInvoiceStatus {
  switch ((value ?? "").toLowerCase()) {
    case "new":
      return BitPayInvoiceStatus.NEW;
    case "paid":
      return BitPayInvoiceStatus.PAID;
    case "confirmed":
      return BitPayInvoiceStatus.CONFIRMED;
    case "complete":
      return BitPayInvoiceStatus.COMPLETE;
    case "expired":
      return BitPayInvoiceStatus.EXPIRED;
    case "invalid":
      return BitPayInvoiceStatus.INVALID;
    default:
      return BitPayInvoiceStatus.NEW;
  }
}

export async function createBitPayInvoice(params: {
  price: number | string;
  currency: string;
  orderId: string;
  itemDesc: string;
  notificationURL: string;
  redirectURL: string;
}): Promise<BitPayInvoiceCreateResult> {
  const token = assertEnv("BITPAY_API_TOKEN");

  const response = await fetch("https://api.bitpay.com/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Accept-Version": "2.0.0",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      price: Number(params.price),
      currency: params.currency,
      orderId: params.orderId,
      itemDesc: params.itemDesc,
      notificationURL: params.notificationURL,
      redirectURL: params.redirectURL,
      transactionSpeed: "medium",
      fullNotifications: true,
      extendedNotifications: true,
      token,
    }),
    cache: "no-store",
  });

  const raw = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      raw && typeof raw === "object" && "error" in raw
        ? JSON.stringify((raw as { error?: unknown }).error)
        : "BitPay invoice creation failed";
    throw new Error(message);
  }

  const data =
    raw && typeof raw === "object" && "data" in raw
      ? ((raw as { data: BitPayInvoiceResponseData }).data ?? null)
      : null;

  if (!data?.id || !data?.url) {
    throw new Error("Invalid BitPay create invoice response");
  }

  return {
    invoiceId: String(data.id),
    invoiceUrl: String(data.url),
    status: (
      (data.status ?? "new") as string
    ).toLowerCase() as BitPayInvoiceCreateResult["status"],
    price: String(data.price ?? params.price),
    currency: String(data.currency ?? params.currency),
    token: data.token ? String(data.token) : null,
    orderId: data.orderId ? String(data.orderId) : null,
    posData: data.posData ? String(data.posData) : null,
    raw,
  };
}

export async function retrieveBitPayInvoice(
  invoiceId: string,
): Promise<BitPayInvoiceVerificationResult> {
  const token = assertEnv("BITPAY_API_TOKEN");

  const url = new URL(
    `https://api.bitpay.com/invoices/${encodeURIComponent(invoiceId)}`,
  );
  url.searchParams.set("token", token);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Accept-Version": "2.0.0",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const raw = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      raw && typeof raw === "object" && "error" in raw
        ? JSON.stringify((raw as { error?: unknown }).error)
        : "BitPay invoice retrieval failed";
    throw new Error(message);
  }

  const data =
    raw && typeof raw === "object" && "data" in raw
      ? ((raw as { data: BitPayInvoiceResponseData }).data ?? null)
      : null;

  if (!data?.id || !data?.status) {
    throw new Error("Invalid BitPay retrieve invoice response");
  }

  return {
    invoiceId: String(data.id),
    status: String(data.status),
    price: String(data.price ?? ""),
    currency: String(data.currency ?? ""),
    orderId: data.orderId ? String(data.orderId) : null,
    invoiceUrl: data.url ? String(data.url) : null,
    token: data.token ? String(data.token) : null,
    posData: data.posData ? String(data.posData) : null,
    exceptionStatus: data.exceptionStatus ? String(data.exceptionStatus) : null,
    amountPaid:
      data.amountPaid !== null && data.amountPaid !== undefined
        ? String(data.amountPaid)
        : null,
    amountDue:
      data.amountDue !== null && data.amountDue !== undefined
        ? String(data.amountDue)
        : null,
    rate:
      data.rate !== null && data.rate !== undefined ? String(data.rate) : null,
    raw,
  };
}
