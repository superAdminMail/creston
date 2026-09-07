"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

type PromotionHighlight = {
  title: string;
  description?: string;
};

type PromotionStep = {
  number: string;
  title: string;
  description: string;
};

type PromotionTerm = {
  title: string;
  description: string;
};

type Campaign = {
  id: string;
  slug: string | null;
  title: string;
  subject: string | null;
  promotionType: string;
  description: string | null;
  highlights: PromotionHighlight[];
  steps: PromotionStep[];
  terms: PromotionTerm[];
  rewardEnabled: boolean;
  rewardAmount: string;
  rewardCurrency: string;
  promoCode: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  maxRedemptions: number | null;
  redemptionCount: number;
  metadata: unknown;
  createdAt: string;
  isFeatured: boolean;
};

type OffersClientProps = {
  featuredCampaign: Campaign | null;
  campaigns: Campaign[];
  siteName: string;
};

export default function OffersClient({
  featuredCampaign,
  campaigns,
  siteName,
}: OffersClientProps) {
  const visibleCampaigns = campaigns.filter((campaign) => campaign.slug);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,hsl(var(--primary)/0.14),transparent_55%)]" />

        <div className="mx-auto max-w-7xl px-6 pb-20 pt-16 sm:px-8 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur">
              <Sparkles className="size-4 text-primary" />
              {siteName} opportunities
            </div>

            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Opportunities built around your financial goals.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              Explore current {siteName} campaigns, investment opportunities,
              and promotions designed to help you make more informed financial
              decisions.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/30">
        <div className="mx-auto grid max-w-7xl divide-y px-6 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-10">
          <TrustItem
            icon={ShieldCheck}
            title="Built with security in mind"
            description="Your account and financial information are protected."
          />

          <TrustItem
            icon={BadgeCheck}
            title="Transparent opportunities"
            description="Understand the terms before you make a decision."
          />

          <TrustItem
            icon={Clock3}
            title="Current opportunities"
            description="Campaign availability and terms may change over time."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Explore</p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Current opportunities
            </h2>

            <p className="mt-2 max-w-xl text-muted-foreground">
              Discover what&apos;s currently available through {siteName}.
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            {visibleCampaigns.length + (featuredCampaign ? 1 : 0)}{" "}
            {visibleCampaigns.length + (featuredCampaign ? 1 : 0) === 1
              ? "opportunity"
              : "opportunities"}{" "}
            available
          </div>
        </div>

        {featuredCampaign || visibleCampaigns.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {featuredCampaign ? (
              <FeaturedCampaign campaign={featuredCampaign} />
            ) : (
              <div className="lg:col-span-2">
                <EmptyFeaturedOffer />
              </div>
            )}

            <div className="grid gap-6">
              {visibleCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyOffers />
        )}
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="relative overflow-hidden rounded-3xl border bg-muted/30 px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
            <div className="absolute -right-32 -top-32 size-80 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="text-sm font-medium text-primary">{siteName}</p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Your financial journey starts with a decision.
                </h2>

                <p className="mt-4 leading-7 text-muted-foreground">
                  Explore {siteName} and discover tools designed to give you
                  greater visibility and control over your financial goals.
                </p>
              </div>

              <Link
                href="/auth/get-started"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Create your account
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function getShortDescription(description: string | null, maxLength = 180) {
  const text =
    description?.trim() || "Explore this opportunity from Havenstone.";

  if (text.length <= maxLength) {
    return {
      text,
      truncated: false,
    };
  }

  return {
    text: `${text.slice(0, maxLength).trimEnd()}…`,
    truncated: true,
  };
}

function TrustItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 px-0 py-6 md:px-8 md:py-7 first:md:pl-0 last:md:pr-0">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background shadow-sm">
        <Icon className="size-4 text-primary" />
      </div>

      <div>
        <h3 className="text-sm font-medium">{title}</h3>

        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function FeaturedCampaign({ campaign }: { campaign: Campaign }) {
  const presentation = getCampaignPresentation(campaign);
  const Icon = presentation.icon;
  const description = getShortDescription(campaign.description, 240);

  return (
    <article className="group relative flex min-h-[520px] flex-col overflow-hidden rounded-3xl border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${presentation.accent} opacity-80`}
      />

      <div className="absolute right-[-100px] top-[-100px] size-[350px] rounded-full bg-primary/10 blur-3xl transition duration-500 group-hover:bg-primary/15" />

      <div className="relative flex flex-1 flex-col p-7 sm:p-9">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center rounded-full border bg-background/70 px-3 py-1 text-xs font-medium backdrop-blur">
            {presentation.badge}
          </span>

          <div className="flex size-11 items-center justify-center rounded-2xl border bg-background/70 shadow-sm backdrop-blur">
            <Icon className="size-5 text-primary" />
          </div>
        </div>

        <div className="mt-auto max-w-xl">
          <p className="mb-3 text-sm font-medium text-primary">
            {presentation.category}
          </p>

          <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {campaign.title}
          </h3>

          <div className="mt-4 max-w-lg">
            <p className="text-base leading-7 text-muted-foreground">
              {description.text}
            </p>

            {description.truncated && (
              <Link
                href={`/offers/${campaign.slug}`}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:gap-2"
              >
                Read more
                <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>

          <Link
            href={`/offers/${campaign.slug}`}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:gap-3 hover:opacity-90"
          >
            {presentation.cta}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const presentation = getCampaignPresentation(campaign);
  const Icon = presentation.icon;
  const description = getShortDescription(campaign.description, 180);

  return (
    <article className="group relative overflow-hidden rounded-3xl border bg-card p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${presentation.accent} opacity-50`}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-5">
          <div>
            <span className="inline-flex rounded-full border bg-background/70 px-3 py-1 text-xs font-medium backdrop-blur">
              {presentation.badge}
            </span>

            <p className="mt-5 text-sm font-medium text-primary">
              {presentation.category}
            </p>
          </div>

          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border bg-background/70 shadow-sm backdrop-blur">
            <Icon className="size-5 text-primary" />
          </div>
        </div>

        <h3 className="mt-3 text-2xl font-semibold tracking-tight">
          {campaign.title}
        </h3>

        <div className="mt-3 max-w-xl">
          <p className="text-sm leading-6 text-muted-foreground">
            {description.text}
          </p>

          {description.truncated && (
            <Link
              href={`/offers/${campaign.slug}`}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:gap-2"
            >
              Read more
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>

        <Link
          href={`/offers/${campaign.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:gap-3"
        >
          {presentation.cta}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}

function EmptyOffers() {
  return (
    <div className="rounded-3xl border bg-card px-6 py-20 text-center shadow-sm">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border bg-muted/40">
        <Sparkles className="size-6 text-primary" />
      </div>

      <h3 className="mt-5 text-xl font-semibold">No current opportunities</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        There are no public opportunities available right now. Check back soon
        for new campaigns and promotions.
      </p>
    </div>
  );
}

function EmptyFeaturedOffer() {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-3xl border bg-card px-6 py-20 text-center shadow-sm">
      <div>
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border bg-muted/40">
          <Sparkles className="size-6 text-primary" />
        </div>

        <h3 className="mt-5 text-xl font-semibold">No featured opportunity</h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          There is currently no featured opportunity available. Explore the
          other opportunities below.
        </p>
      </div>
    </div>
  );
}

function getCampaignPresentation(campaign: Campaign) {
  if (campaign.rewardEnabled && campaign.isFeatured) {
    return {
      category: "Promotion",
      badge: "Featured promotion",
      cta: "Explore offer",
      accent: "from-emerald-600/20 via-teal-500/10 to-transparent",
      icon: Sparkles,
    };
  }

  if (campaign.rewardEnabled) {
    return {
      category: "Promotion",
      badge: "Special offer",
      cta: "Explore offer",
      accent: "from-emerald-600/20 via-teal-500/10 to-transparent",
      icon: Sparkles,
    };
  }

  if (campaign.isFeatured) {
    return {
      category: "Opportunity",
      badge: "Featured opportunity",
      cta: "Explore opportunity",
      accent: "from-blue-600/20 via-cyan-500/10 to-transparent",
      icon: TrendingUp,
    };
  }

  return {
    category: "Opportunity",
    badge: "Current opportunity",
    cta: "Explore opportunity",
    accent: "from-blue-600/20 via-cyan-500/10 to-transparent",
    icon: TrendingUp,
  };
}
