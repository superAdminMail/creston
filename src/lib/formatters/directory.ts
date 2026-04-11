// src/lib/formatters/directory.ts
import { formatCurrency } from "@/lib/formatters/formatters";

export function formatDirectoryCurrency(value: number) {
  return formatCurrency(value, "USD");
}
