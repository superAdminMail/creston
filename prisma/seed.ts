import { prisma } from "@/lib/prisma";

async function main() {
  // 1. Create Investments (catalog)
  const crypto = await prisma.investment.upsert({
    where: { slug: "crypto" },
    update: {},
    create: {
      name: "Cryptocurrency",
      slug: "crypto",
      description: "Digital assets including Bitcoin and Ethereum",
      type: "CRYPTO",
      period: "LONG_TERM",
      status: "ACTIVE",
      riskLevel: "HIGH",
      isActive: true,
      sortOrder: 1,
    },
  });

  const stocks = await prisma.investment.upsert({
    where: { slug: "stocks" },
    update: {},
    create: {
      name: "Stocks",
      slug: "stocks",
      description: "Equity investments in public companies",
      type: "STOCKS",
      period: "LONG_TERM",
      status: "ACTIVE",
      riskLevel: "MODERATE",
      isActive: true,
      sortOrder: 2,
    },
  });

  const bonds = await prisma.investment.upsert({
    where: { slug: "bonds" },
    update: {},
    create: {
      name: "Bonds",
      slug: "bonds",
      description: "Fixed income securities with stable returns",
      type: "BONDS",
      period: "MEDIUM_TERM",
      status: "ACTIVE",
      riskLevel: "LOW",
      isActive: true,
      sortOrder: 3,
    },
  });

  // 2. Create Investment Plans

  await prisma.investmentPlan.upsert({
    where: { slug: "crypto-growth-plan" },
    update: {},
    create: {
      name: "Crypto Growth Plan",
      slug: "crypto-growth-plan",
      description: "High-risk, high-reward crypto investment strategy",
      investmentId: crypto.id,
      category: "WEALTH_BUILDING",
      period: "LONG_TERM",
      minAmount: 100,
      maxAmount: 10000,
      currency: "USD",
      isActive: true,
    },
  });

  await prisma.investmentPlan.upsert({
    where: { slug: "stocks-retirement-plan" },
    update: {},
    create: {
      name: "Stocks Retirement Plan",
      slug: "stocks-retirement-plan",
      description: "Long-term equity plan designed for retirement",
      investmentId: stocks.id,
      category: "PERSONAL_RETIREMENT",
      period: "LONG_TERM",
      minAmount: 500,
      maxAmount: 50000,
      currency: "USD",
      isActive: true,
    },
  });

  await prisma.investmentPlan.upsert({
    where: { slug: "bond-income-plan" },
    update: {},
    create: {
      name: "Bond Income Plan",
      slug: "bond-income-plan",
      description: "Stable income-focused bond investment plan",
      investmentId: bonds.id,
      category: "INCOME_GENERATION",
      period: "MEDIUM_TERM",
      minAmount: 200,
      maxAmount: 20000,
      currency: "USD",
      isActive: true,
    },
  });

  console.log("✅ Havenstone investment seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
