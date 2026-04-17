import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";

import { InvestmentModelSectionClient } from "@/components/home/investment-model-section.client";

export async function InvestmentModelsSection() {
  const site = await getSiteSeoConfig();

  return (
    <InvestmentModelSectionClient
      siteName={site.siteName}
      cards={[
        {
          key: "savings",
          title: "Savings",
          eyebrow: "Secure Saving",
          href: "/savings-products",
          iconKey: "PiggyBank",
          bgImage:
            "https://h1y5zd586t.ufs.sh/f/8DoDEiOd0OjuGbHPEmQFQP6RCHjxTU7LK3Ot42qesJhvwgl0",
          description:
            "Built for users who want a secure, disciplined way to save, preserve capital, and build financial consistency over time.",
          bullets: [
            "Purpose-driven savings options",
            "Structured saving with flexible access",
            "Built for financial discipline and stability",
          ],
          bestFor: "Capital preservation and goal-based saving",
          approach: "Steady accumulation and balance growth",
          accent: "from-emerald-500/25 via-blue-500/10 to-transparent",
          glow: "bg-emerald-400/20",
        },
        {
          key: "fixed",
          title: "Fixed",
          eyebrow: "Structured Returns",
          href: "/investment-products?model=fixed",
          iconKey: "LockKeyhole",
          bgImage:
            "https://h1y5zd586t.ufs.sh/f/8DoDEiOd0Ojuuc0Hk7BFlTvc2HsJt8AudagIr1jB6fWNhm5R",
          description:
            "Designed for investors who prefer predictability, defined terms, and a more stable path to long-term wealth planning.",
          bullets: [
            "Defined investment term",
            "More predictable return expectations",
            "Built for disciplined capital planning",
          ],
          bestFor: "Structured, stability-focused investing",
          approach: "Defined return structure",
          accent: "from-blue-600/30 via-sky-500/20 to-transparent",
          glow: "bg-blue-500/20",
        },
        {
          key: "market",
          title: "Market",
          eyebrow: "Market Growth",
          href: "/investment-products?model=market",
          iconKey: "TrendingUp",
          bgImage:
            "https://h1y5zd586t.ufs.sh/f/8DoDEiOd0OjuwBHw2mbCHr5DVm6yM7ulFPO28oxfdaT9IehR",
          description:
            "Built for investors seeking broader market exposure, dynamic valuation, and growth aligned with live market movement.",
          bullets: [
            "Market-responsive performance",
            "Flexible growth potential",
            "Suitable for active wealth positioning",
          ],
          bestFor: "Growth-focused, market-linked investing",
          approach: "Market-responsive valuation",
          accent: "from-cyan-500/25 via-blue-500/15 to-transparent",
          glow: "bg-cyan-400/20",
        },
      ]}
    />
  );
}
