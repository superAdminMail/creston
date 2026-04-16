import fs from "fs";
import path from "path";

let DISPOSABLE_SET: Set<string> | null = null;

export function loadDisposableDomainsLocal() {
  if (DISPOSABLE_SET) return DISPOSABLE_SET;

  const filePath = path.join(
    process.cwd(),
    "src/lib/data/disposable-domains.txt",
  );

  const text = fs.readFileSync(filePath, "utf-8");

  DISPOSABLE_SET = new Set(
    text
      .split("\n")
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean),
  );

  return DISPOSABLE_SET;
}
