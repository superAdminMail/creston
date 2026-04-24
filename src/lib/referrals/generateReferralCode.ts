export function generateReferralCode(name?: string | null) {
  const prefix =
    name
      ?.replace(/[^a-zA-Z]/g, "")
      .slice(0, 4)
      .toUpperCase() || "HVN";

  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `${prefix}${suffix}`;
}
