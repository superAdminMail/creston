export function getSavingsProductFormData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    interestEnabled: String(formData.get("interestEnabled") ?? "false") === "true",
    interestRatePercent: String(formData.get("interestRatePercent") ?? ""),
    interestPayoutFrequency: String(
      formData.get("interestPayoutFrequency") ?? "",
    ),
    isLockable: String(formData.get("isLockable") ?? "false") === "true",
    minimumLockDays: String(formData.get("minimumLockDays") ?? ""),
    maximumLockDays: String(formData.get("maximumLockDays") ?? ""),
    allowsWithdrawals:
      String(formData.get("allowsWithdrawals") ?? "false") === "true",
    allowsDeposits:
      String(formData.get("allowsDeposits") ?? "false") === "true",
    minBalance: String(formData.get("minBalance") ?? ""),
    maxBalance: String(formData.get("maxBalance") ?? ""),
    currency: String(formData.get("currency") ?? ""),
    isActive: String(formData.get("isActive") ?? "false") === "true",
    sortOrder: String(formData.get("sortOrder") ?? ""),
  };
}
