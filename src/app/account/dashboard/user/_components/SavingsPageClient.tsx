"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { create } from "domain";
import { createSavingsAccount } from "@/actions/savings/createSavingsAccount";

type SavingsProduct = {
  id: string;
  name: string;
  description: string | null;
  interestEnabled: boolean;
  interestRatePercent: number | null;
  interestPayoutFrequency: string | null;
  isLockable: boolean;
  minimumLockDays: number | null;
  allowsWithdrawals: boolean;
};

export default function SavingsPageClient({
  initialProducts,
}: {
  initialProducts: SavingsProduct[];
}) {
  const [products] = useState(initialProducts);
  const [selected, setSelected] = useState<string | null>(
    initialProducts[0]?.id ?? null,
  );

  function buildFeatures(product: SavingsProduct): string[] {
    const features: string[] = [];

    // Interest
    if (product.interestEnabled && product.interestRatePercent) {
      features.push(`${product.interestRatePercent}% annual interest`);
      if (product.interestPayoutFrequency) {
        features.push(
          `${product.interestPayoutFrequency.toLowerCase()} payouts`,
        );
      }
    } else {
      features.push("No interest earnings");
    }

    // Lock
    if (product.isLockable && product.minimumLockDays) {
      features.push(`Min ${product.minimumLockDays} days lock period`);
    } else {
      features.push("No lock period");
    }

    // Withdrawals
    if (product.allowsWithdrawals) {
      features.push("Flexible withdrawals");
    } else {
      features.push("Withdrawals restricted");
    }

    return features;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">
          Personal Savings Accounts
        </h1>
        <p className="text-slate-400 text-sm">
          Choose how you want to grow and manage your savings.
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {products.map((product) => {
          const isSelected = selected === product.id;
          const features = buildFeatures(product);

          return (
            <Card
              key={product.id}
              onClick={() => setSelected(product.id)}
              className={cn(
                "cursor-pointer transition-all border rounded-2xl",
                "bg-white/5 border-white/10 hover:border-white/20",
                isSelected && "border-blue-500 bg-blue-500/10",
              )}
            >
              <CardContent className="p-6 space-y-4">
                {/* Title */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {product.name}
                  </h2>

                  {isSelected && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                      Selected
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed">
                  {product.description ?? "No description available"}
                </p>

                {/* Features */}
                <ul className="space-y-2 text-sm text-slate-300">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action */}
      <div className="pt-4 flex justify-end">
        <form action={createSavingsAccount}>
          <input type="hidden" name="productId" value={selected ?? ""} />

          <button
            type="submit"
            disabled={!selected}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-sm font-medium transition"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
