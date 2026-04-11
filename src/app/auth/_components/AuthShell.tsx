import Link from "next/link";

import { cn } from "@/lib/utils";

type AuthShellProps = {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
  siteName: string;
  siteLogoUrl?: string | null;
  footer?: React.ReactNode;
  className?: string;
};

function SiteMark({
  siteName,
  siteLogoUrl,
}: {
  siteName: string;
  siteLogoUrl?: string | null;
}) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] border border-white/12 bg-[linear-gradient(145deg,rgba(37,99,235,0.2),rgba(59,130,246,0.06))] shadow-[0_14px_40px_rgba(37,99,235,0.18)]">
      {siteLogoUrl ? (
        <img
          src={siteLogoUrl}
          alt={`${siteName} logo`}
          className="h-10 w-10 rounded-2xl object-cover"
        />
      ) : (
        <span className="text-base font-semibold text-white">
          {siteName.slice(0, 1).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export function AuthShell({
  children,
  description,
  eyebrow,
  title,
  siteName,
  siteLogoUrl,
  footer,
  className,
}: AuthShellProps) {
  return (
    <main className="relative ">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-5%] top-[12%] h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-[-3%] top-[22%] h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div
          className={cn(
            "relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(5,11,31,0.98))] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.34)] sm:p-8",
            className,
          )}
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(96,165,250,0.4),transparent)]" />

          <div className="flex flex-col items-center text-center">
            <Link
              href="/"
              aria-label={`${siteName} home`}
              className="inline-flex rounded-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <SiteMark siteName={siteName} siteLogoUrl={siteLogoUrl} />
            </Link>

            <p className="mt-5 text-xs font-medium tracking-[0.18em] text-blue-200 uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
              {title}
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-7 text-slate-300">
              {description}
            </p>
          </div>

          <div className="mt-8">{children} </div>

          {footer ? (
            <div className="mt-6 border-t border-white/8 pt-5">{footer} </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
