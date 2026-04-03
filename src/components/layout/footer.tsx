import Link from "next/link";

const footerLinkGroups = [
  {
    title: "Company",
    links: [
      { href: "#why-havenstone", label: "Why Havenstone" },
      { href: "#testimonials", label: "Testimonials" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "#how-it-works", label: "How It Works" },
      { href: "#benefits", label: "Benefits" },
      { href: "/security", label: "Security" },
      { href: "/plans", label: "Plans" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "#faq", label: "FAQ" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/compliance", label: "Compliance" },
    ],
  },
];

function HavenstoneMark() {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-[linear-gradient(145deg,rgba(37,99,235,0.20),rgba(59,130,246,0.05))] shadow-[0_12px_34px_rgba(37,99,235,0.16)]">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--gradient-brand)] text-sm font-semibold text-white">
        H
      </span>
    </span>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-white/8 bg-[linear-gradient(180deg,rgba(5,11,31,0.78),rgba(5,11,31,0.98))]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(96,165,250,0.28),transparent)]" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))]">
          <div className="max-w-md">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
              aria-label="Havenstone home"
            >
              <HavenstoneMark />
              <span className="flex flex-col">
                <span className="text-lg font-semibold tracking-[-0.03em] text-white">
                  Havenstone
                </span>
                <span className="text-xs tracking-[0.12em] text-slate-400 uppercase">
                  Financial Growth Platform
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
              Havenstone is a financial growth platform built to help potential
              investors achieve their financial goals with investment programs
              that feel secure, transparent, and dependable at every stage of
              growth.
            </p>

            <div className="card-premium mt-6 rounded-3xl p-5">
              <p className="text-sm font-medium text-white">
                Built for confidence at scale
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Premium account access, clear contribution visibility, and a
                modern experience grounded in trust.
              </p>
            </div>
          </div>

          {footerLinkGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-sm font-semibold tracking-[0.14em] text-slate-200 uppercase">
                {group.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 pt-6">
          <div className="divider-premium" />
          <div className="flex flex-col gap-3 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>&copy; {year} Havenstone. All rights reserved.</p>
            <p>Secure infrastructure. Clear communication. Long-term trust.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
