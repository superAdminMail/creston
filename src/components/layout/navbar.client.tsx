"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useId, useState } from "react";

import * as authClient from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export type NavbarClientProps = {
  siteName: string;
  siteLogoUrl?: string | null;
  siteTagline?: string | null;
};

const marketingLinks = (siteName: string) => [
  { href: "#why-havenstone", label: `Why ${siteName}` },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#benefits", label: "Benefits" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq", label: "FAQ" },
];

const publicAuthLinks = {
  getStarted: "/auth/get-started",
  login: "/auth/login",
};

const dashboardLink = "/account";

function BrandMark({
  siteName,
  siteLogoUrl,
}: {
  siteName: string;
  siteLogoUrl?: string | null;
}) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-[1.35rem] border border-white/12 bg-[linear-gradient(145deg,rgba(37,99,235,0.2),rgba(59,130,246,0.06))] shadow-[0_14px_40px_rgba(37,99,235,0.18)]">
      {siteLogoUrl ? (
        <img
          src={siteLogoUrl}
          alt={`${siteName} logo`}
          className="h-9 w-9 rounded-2xl object-cover "
        />
      ) : (
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
          {siteName.slice(0, 1)}
        </span>
      )}
    </div>
  );
}

function Brand({ siteName, siteLogoUrl, siteTagline }: NavbarClientProps) {
  return (
    <Link
      href="/"
      className="group flex min-w-0 items-center gap-3"
      aria-label={`${siteName} home`}
    >
      <BrandMark siteName={siteName} siteLogoUrl={siteLogoUrl} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-base font-semibold tracking-[-0.03em] text-white sm:text-lg">
          {siteName}
        </span>
        <span className="hidden truncate text-xs uppercase tracking-[0.12em] text-slate-400 sm:block">
          {siteTagline ?? "Positioned for the Peak"}
        </span>
      </span>
    </Link>
  );
}

function MarketingItems({
  siteName,
  className,
  onNavigate,
}: {
  siteName: string;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {marketingLinks(siteName).map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/6 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
            className,
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

function ActionLinks({
  isPending = false,
  isSignedIn = false,
  mobile = false,
  onNavigate,
}: {
  isPending?: boolean;
  isSignedIn?: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  if (isPending) {
    return (
      <div className={cn("flex items-center gap-3", mobile && "grid gap-3")}>
        <div
          aria-hidden="true"
          className={cn(
            "h-10 w-24 rounded-full bg-white/6 animate-pulse",
            mobile && "h-12 w-full rounded-2xl",
          )}
        />
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className={cn("flex items-center gap-3", mobile && "grid gap-3")}>
        <Link
          href={dashboardLink}
          onClick={onNavigate}
          className={cn(
            "btn-primary inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold",
            mobile && "min-h-12 rounded-2xl px-5 py-3",
          )}
        >
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", mobile && "grid gap-3")}>
      <Link
        href={publicAuthLinks.login}
        onClick={onNavigate}
        className={cn(
          "rounded-full px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/6 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          mobile &&
            "justify-center border border-white/10 bg-white/4 px-5 py-3 text-center text-slate-100",
        )}
      >
        Log in
      </Link>

      <Link
        href={publicAuthLinks.getStarted}
        onClick={onNavigate}
        className={cn(
          "btn-primary inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold",
          mobile && "min-h-12 px-5 py-3",
        )}
      >
        Get Started
      </Link>
    </div>
  );
}

export function NavbarClient({
  siteName,
  siteLogoUrl,
  siteTagline,
}: NavbarClientProps) {
  const { data: session, isPending } = authClient.useSession();
  const menuId = useId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isSignedIn = Boolean(session?.user);

  return (
    <header className="sticky top-0 z-[80] w-full px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[calc(var(--radius)*1.5)] border border-white/10 bg-[linear-gradient(180deg,rgba(8,17,37,0.96),rgba(5,11,31,0.985))] shadow-[0_22px_55px_rgba(0,0,0,0.34)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(96,165,250,0.44),transparent)]" />

          <div className="absolute inset-x-6 top-[72px] hidden h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),rgba(96,165,250,0.16),rgba(255,255,255,0.08),transparent)] lg:block" />

          <div className="flex min-h-[72px] items-center gap-3 px-4 sm:px-5 lg:px-6">
            <div className="flex min-w-0 flex-1 items-center">
              <Brand
                siteName={siteName}
                siteLogoUrl={siteLogoUrl}
                siteTagline={siteTagline}
              />
            </div>

            <div className="hidden flex-1 items-center justify-end lg:flex">
              <ActionLinks isPending={isPending} isSignedIn={isSignedIn} />
            </div>

            <button
              type="button"
              aria-controls={menuId}
              aria-expanded={isMenuOpen}
              aria-label={
                isMenuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              onClick={() => setIsMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] lg:hidden"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="hidden lg:block">
            <div className="flex items-center justify-center px-6 pb-3 pt-2">
              <nav
                aria-label="Marketing navigation"
                className="flex items-center gap-1 rounded-full border border-white/6 bg-white/[0.025] px-2 py-1.5"
              >
                <MarketingItems
                  siteName={siteName}
                  className="px-3 py-1.5 text-[0.925rem]"
                />
              </nav>
            </div>
          </div>

          <div
            id={menuId}
            className={cn(
              "grid overflow-hidden border-t border-white/8 transition-[grid-template-rows,opacity] duration-300 ease-out lg:hidden",
              isMenuOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="min-h-0">
              <div className="space-y-6 px-4 py-4 sm:px-5">
                <nav aria-label="Mobile navigation" className="grid gap-2">
                  <MarketingItems
                    siteName={siteName}
                    onNavigate={() => setIsMenuOpen(false)}
                    className="rounded-2xl px-4 py-3"
                  />
                </nav>

                <div className="divider-premium" />

                <ActionLinks
                  mobile
                  isPending={isPending}
                  isSignedIn={isSignedIn}
                  onNavigate={() => setIsMenuOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
