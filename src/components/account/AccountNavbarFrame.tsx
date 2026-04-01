"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { AccountMenu } from "./AccountMenu";

type AccountNavbarFrameProps = {
  avatarUrl?: string | null;
  badgeLabel: string;
  breadcrumbRootLabel: string;
  dashboardHref: string;
  email?: string | null;
  menuButton?: React.ReactNode;
  name?: string | null;
  title: string;
  variant: "user" | "staff";
};

function getBreadcrumbItems(
  pathname: string,
  dashboardHref: string,
  rootLabel: string,
) {
  const normalizedPath = pathname.replace(/\/$/, "");
  const normalizedDashboardHref = dashboardHref.replace(/\/$/, "");

  if (
    normalizedPath === normalizedDashboardHref ||
    normalizedPath === "/account/dashboard"
  ) {
    return [{ href: dashboardHref, label: rootLabel, isLast: true }];
  }

  const afterBase = normalizedPath
    .replace(normalizedDashboardHref, "")
    .split("/")
    .filter(Boolean);

  const toLabel = (segment: string) =>
    segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  let runningPath = normalizedDashboardHref;
  const items = [{ href: dashboardHref, label: rootLabel, isLast: false }];

  afterBase.forEach((segment, index) => {
    runningPath += `/${segment}`;
    items.push({
      href: runningPath,
      label: toLabel(segment),
      isLast: index === afterBase.length - 1,
    });
  });

  if (items.length === 1) {
    items[0].isLast = true;
  }

  return items;
}

export function AccountNavbarFrame({
  avatarUrl,
  badgeLabel,
  breadcrumbRootLabel,
  dashboardHref,
  email,
  menuButton,
  name,
  title,
  variant,
}: AccountNavbarFrameProps) {
  const pathname = usePathname() ?? dashboardHref;
  const breadcrumbItems = getBreadcrumbItems(
    pathname,
    dashboardHref,
    breadcrumbRootLabel,
  );

  const isUser = variant === "user";

  return (
    <header
      className={
        isUser
          ? "sticky top-0 z-40 overflow-hidden rounded-[1.6rem] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.05))] shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-2xl"
          : "sticky top-0 z-40 overflow-hidden rounded-[1.45rem] border border-white/8 bg-[linear-gradient(180deg,rgba(8,17,37,0.92),rgba(5,11,31,0.97))] shadow-[0_16px_38px_rgba(0,0,0,0.22)] backdrop-blur-xl"
      }
    >
      <div className="flex min-h-[68px] items-center justify-between gap-3 px-4 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={dashboardHref}
            className="flex shrink-0 items-center gap-2"
            aria-label={`${title} home`}
          >
            <Image
              src="/site-logo.svg"
              alt="Havenstone"
              width={40}
              height={40}
              className="object-contain"
            />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-base font-semibold tracking-tight text-white sm:text-[17px]">
                {title}
              </span>
              <span
                className={
                  isUser
                    ? "hidden sm:inline-flex rounded-full border border-blue-400/15 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-100"
                    : "hidden sm:inline-flex rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300"
                }
              >
                {badgeLabel}
              </span>
            </div>

            <div className="mt-1 hidden min-w-0 items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs sm:flex">
              {breadcrumbItems.map((item, index) => (
                <div
                  key={`${item.href}-${index}`}
                  className="flex items-center gap-1.5"
                >
                  {item.isLast ? (
                    <span
                      className={
                        isUser
                          ? "font-medium text-blue-100"
                          : "font-medium text-slate-100"
                      }
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className={
                        isUser
                          ? "text-slate-300 hover:text-white"
                          : "text-slate-400 hover:text-slate-100"
                      }
                    >
                      {item.label}
                    </Link>
                  )}

                  {!item.isLast ? (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <AccountMenu
            avatarUrl={avatarUrl}
            dashboardHref={dashboardHref}
            email={email}
            name={name}
            variant={variant}
          />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <AccountMenu
            avatarUrl={avatarUrl}
            dashboardHref={dashboardHref}
            email={email}
            name={name}
            variant={variant}
          />

          {menuButton ?? (
            <Button
              variant="ghost"
              size="icon"
              className={
                isUser
                  ? "h-10 w-10 rounded-full border border-white/15 bg-white/10 text-slate-100 hover:bg-white/15"
                  : "h-10 w-10 rounded-full border border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
              }
              aria-label="Open dashboard navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
