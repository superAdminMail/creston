"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

type SavingsAccount = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  productName: string;
  interestEnabled: boolean;
};

export default function SavingsDashboard({
  accounts,
}: {
  accounts: SavingsAccount[];
}) {
  const router = useRouter();

  const hasAccounts = accounts.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">
            Personal Savings Accounts
          </h1>
          <p className="text-slate-400 text-sm">
            Manage and track your savings accounts.
          </p>
        </div>
        <Button
          onClick={() => router.push("/account/dashboard/user/savings/new")}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className=" h-4 w-4" /> Add Savings Account
        </Button>
      </div>

      {/* EMPTY STATE */}
      {!hasAccounts && (
        <Card className="bg-white/5 border-white/10 text-center">
          <CardContent className="p-10 space-y-4">
            <h2 className="text-lg font-semibold text-white">
              No savings account yet
            </h2>

            <p className="text-sm text-slate-400">
              Start saving by creating your first account.
            </p>

            <Button
              onClick={() => router.push("/account/dashboard/user/savings/new")}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Create Savings Account
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ACCOUNTS */}
      {hasAccounts && (
        <div className="grid md:grid-cols-2 gap-6">
          {accounts.map((acc) => (
            <Card
              key={acc.id}
              className="bg-white/5 border-white/10 hover:border-white/20 transition"
            >
              <CardContent className="p-6 space-y-4">
                {/* Title */}
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">
                    {acc.name}
                  </h2>

                  {acc.interestEnabled && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                      Interest
                    </span>
                  )}
                </div>

                {/* Balance */}
                <div>
                  <p className="text-xs text-slate-400">Available Balance</p>
                  <h3 className="text-2xl font-semibold text-white mt-1">
                    ${acc.balance.toLocaleString()}
                  </h3>
                </div>

                {/* Product */}
                <p className="text-xs text-slate-400">{acc.productName}</p>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                    Deposit
                  </Button>

                  <Button size="sm" variant="secondary">
                    Withdraw
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
