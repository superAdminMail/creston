type DecimalLike = { toNumber(): number } | number | null | undefined;

type ReviewUserLike = {
  id: string | null;
  name: string | null;
  email: string | null;
} | null | undefined;

type ReviewReceiptLike = {
  id: string;
  fileName: string;
  url: string | null;
} | null | undefined;

export const reviewUserSelect = {
  select: {
    id: true,
    name: true,
    email: true,
  },
} as const;

export const reviewReceiptSelect = {
  select: {
    id: true,
    fileName: true,
    url: true,
  },
} as const;

export function decimalToNumber(value: DecimalLike) {
  if (typeof value === "number") return value;
  return value?.toNumber?.() ?? 0;
}

export const toNumber = decimalToNumber;

export function mapReviewUser(user: ReviewUserLike) {
  return {
    id: user?.id ?? null,
    name: user?.name ?? null,
    email: user?.email ?? null,
  };
}

export function mapReviewReceipt(receipt: ReviewReceiptLike) {
  if (!receipt) {
    return null;
  }

  return {
    id: receipt.id,
    fileName: receipt.fileName,
    url: receipt.url ?? null,
  };
}
