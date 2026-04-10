"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function PerformancePage() {
  const portfolio = {
    totalValue: 12450,
    profit: 2450,
    changePercent: 24.5,
  };

  const assets = [
    {
      name: "Bitcoin Growth Strategy",
      value: 5000,
      change: "+12.4%",
    },
    {
      name: "Global Equity Portfolio",
      value: 4200,
      change: "+6.2%",
    },
    {
      name: "Commodities Fund",
      value: 3250,
      change: "-2.1%",
    },
  ];

  const activities = [
    {
      title: "Deposit",
      amount: "+$2,000",
      date: "Apr 2",
    },
    {
      title: "Interest Earned",
      amount: "+$120",
      date: "Apr 1",
    },
    {
      title: "Withdrawal",
      amount: "-$500",
      date: "Mar 28",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Performance</h1>
        <p className="text-slate-400 text-sm">
          Track your portfolio growth and activity over time.
        </p>
      </div>

      {/* Portfolio Overview */}
      <Card className="bg-gradient-to-br from-blue-600/20 to-blue-500/5 border border-blue-500/20 rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-slate-300">Total Portfolio Value</p>

          <h2 className="text-3xl font-bold text-white">
            ${portfolio.totalValue.toLocaleString()}
          </h2>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-400 font-medium">
              +${portfolio.profit.toLocaleString()}
            </span>
            <span className="text-green-400">{portfolio.changePercent}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Asset Breakdown */}
      <div className="grid md:grid-cols-3 gap-6">
        {assets.map((asset, idx) => (
          <Card
            key={idx}
            className="bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition"
          >
            <CardContent className="p-5 space-y-3">
              <p className="text-sm text-slate-400">{asset.name}</p>

              <h3 className="text-xl font-semibold text-white">
                ${asset.value.toLocaleString()}
              </h3>

              <span
                className={`text-sm font-medium ${
                  asset.change.startsWith("+")
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {asset.change}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Section */}
      <Card className="bg-white/5 border border-white/10 rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>

          <div className="space-y-3">
            {activities.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-white/5 pb-3 last:border-none"
              >
                <div>
                  <p className="text-sm text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.date}</p>
                </div>

                <span
                  className={`text-sm font-medium ${
                    item.amount.startsWith("+")
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {item.amount}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
