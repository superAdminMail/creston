import {
  InvestmentType,
  InvestmentModel,
  InvestmentCatalogStatus,
  InvestmentTierLevel,
} from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

async function main() {
  const investments = [
    {
      name: "Global Equity Growth Portfolio",
      slug: "global-equity-growth-portfolio",
      description:
        "Invest in a diversified basket of high-performing global companies across key sectors. This portfolio targets long-term capital appreciation driven by market growth.",
      type: InvestmentType.STOCKS,
      symbol: "AAPL",
      model: InvestmentModel.MARKET,
    },
    {
      name: "Gold ETF Portfolio",
      slug: "gold-etf-portfolio",
      description:
        "Gain exposure to a broad market index through ETFs, offering balanced risk and steady long-term growth aligned with overall market performance.",
      type: InvestmentType.ETFS,
      symbol: "GLD",
      model: InvestmentModel.MARKET,
    },
    {
      name: "Bitcoin Growth Strategy",
      slug: "bitcoin-growth-strategy",
      description:
        "Participate in the digital economy through leading cryptocurrencies with high growth potential and market-driven price movements.",
      type: InvestmentType.CRYPTO,
      symbol: "BTC",
      model: InvestmentModel.MARKET,
    },
    {
      name: "Ethereum Growth Strategy",
      slug: "ethereum-growth-strategy",
      description:
        "Participate in the digital economy through leading cryptocurrencies with high growth potential and market-driven price movements.",
      type: InvestmentType.CRYPTO,
      symbol: "ETH",
      model: InvestmentModel.MARKET,
    },
    {
      name: "Gold Commodity Fund",
      slug: "gold-commodity-fund",
      description:
        "Invest in commodities like gold to hedge against inflation and maintain exposure to real asset value movements.",
      type: InvestmentType.COMMODITIES,
      symbol: "GLD",
      model: InvestmentModel.MARKET,
    },
    {
      name: "OIL & Gas Commodity Fund",
      slug: "oil-commodity-fund",
      description:
        "Invest in commodities like gold to hedge against inflation and maintain exposure to real asset value movements.",
      type: InvestmentType.COMMODITIES,
      symbol: "OIL",
      model: InvestmentModel.MARKET,
    },
    {
      name: "Fixed Income Yield Plan",
      slug: "fixed-income-yield-plan",
      description:
        "Earn stable and predictable returns through fixed-income instruments designed for capital preservation and consistent yield.",
      type: InvestmentType.BONDS,
      symbol: null,
      model: InvestmentModel.FIXED,
    },
  ];

  for (const inv of investments) {
    // 1. Create / update Investment
    const investment = await prisma.investment.upsert({
      where: { slug: inv.slug },
      update: {
        name: inv.name,
        description: inv.description,
        type: inv.type,
        symbol: inv.symbol,
        status: InvestmentCatalogStatus.ACTIVE,
        isActive: true,
      },
      create: {
        name: inv.name,
        slug: inv.slug,
        description: inv.description,
        type: inv.type,
        symbol: inv.symbol,
        status: InvestmentCatalogStatus.ACTIVE,
        isActive: true,
        sortOrder: 0,
      },
    });

    // 2. Create Plan
    const plan = await prisma.investmentPlan.upsert({
      where: { slug: `${inv.slug}-plan` },
      update: {},
      create: {
        name: `${inv.name} Plan`,
        slug: `${inv.slug}-plan`,
        investmentId: investment.id,
        investmentModel: inv.model,

        // MARKET config
        expectedReturnMin: inv.model === "MARKET" ? 5 : null,
        expectedReturnMax: inv.model === "MARKET" ? 18 : null,

        // FIXED config
        durationDays: inv.model === "FIXED" ? 30 : undefined,
        isLocked: inv.model === "FIXED",
        allowWithdrawal: true,

        // Penalty (only FIXED)
        penaltyFreePeriodDays: inv.model === "FIXED" ? 3 : 0,
        penaltyType: inv.model === "FIXED" ? "PERCENT" : null,
        earlyWithdrawalPenaltyValue: inv.model === "FIXED" ? 10 : null,
        maxPenaltyAmount: inv.model === "FIXED" ? 200 : null,

        currency: "USD",
        isActive: true,
        sortOrder: 0,
      },
    });

    // 3. Create Tiers
    const tiers = [
      {
        level: InvestmentTierLevel.CORE,
        min: 100,
        max: 999,
        roi: 5,
      },
      {
        level: InvestmentTierLevel.ADVANCED,
        min: 1000,
        max: 4999,
        roi: 8,
      },
      {
        level: InvestmentTierLevel.ELITE,
        min: 5000,
        max: 99999,
        roi: 12,
      },
    ];

    for (const tier of tiers) {
      await prisma.investmentPlanTier.upsert({
        where: {
          investmentPlanId_level: {
            investmentPlanId: plan.id,
            level: tier.level,
          },
        },
        update: {},
        create: {
          investmentPlanId: plan.id,
          level: tier.level,
          minAmount: tier.min,
          maxAmount: tier.max,

          // Only FIXED uses ROI
          roiPercent: inv.model === "FIXED" ? tier.roi : null,

          isActive: true,
        },
      });
    }
  }

  console.log("✅ Full investment catalog seeded");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
