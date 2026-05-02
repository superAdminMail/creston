import { Prisma } from "@/generated/prisma";

export const ZERO_DECIMAL = new Prisma.Decimal(0);

type DecimalLike = Prisma.Decimal | { toNumber(): number };

export function toDecimal(
  value: Prisma.Decimal | number | string | null | undefined,
): Prisma.Decimal {
  if (value instanceof Prisma.Decimal) {
    return value;
  }

  if (value === null || value === undefined || value === "") {
    return ZERO_DECIMAL;
  }

  return new Prisma.Decimal(value);
}

export function decimalToNumber(
  value: DecimalLike | number | string | null | undefined,
): number {
  if (typeof value === "number") {
    return value;
  }

  if (value && typeof value === "object" && "toNumber" in value) {
    return value.toNumber();
  }

  return toDecimal(value).toNumber();
}

export function minDecimal(
  left: Prisma.Decimal | number | string,
  right: Prisma.Decimal | number | string,
): Prisma.Decimal {
  const leftValue = toDecimal(left);
  const rightValue = toDecimal(right);

  return leftValue.lessThan(rightValue) ? leftValue : rightValue;
}

export function maxDecimal(
  left: Prisma.Decimal | number | string,
  right: Prisma.Decimal | number | string,
): Prisma.Decimal {
  const leftValue = toDecimal(left);
  const rightValue = toDecimal(right);

  return leftValue.greaterThan(rightValue) ? leftValue : rightValue;
}

export function sumDecimals(
  values: Array<Prisma.Decimal | number | string | null | undefined>,
): Prisma.Decimal {
  return values.reduce<Prisma.Decimal>(
    (sum, value) => sum.add(toDecimal(value)),
    new Prisma.Decimal(0),
  );
}
