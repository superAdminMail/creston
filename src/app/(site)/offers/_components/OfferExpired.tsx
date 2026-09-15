import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";

type OfferExpiredProps = {
  title?: string;
  expiredAt?: Date | string | null;
};

export function OfferExpired({
  title = "This offer has expired",
  expiredAt,
}: OfferExpiredProps) {
  const formattedExpiredAt = expiredAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(expiredAt))
    : null;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <section className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0F172A]/80 shadow-2xl backdrop-blur-xl">
        <div className="px-6 py-12 text-center sm:px-10 sm:py-16">
          <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
            <Clock3 className="h-8 w-8 text-blue-400" aria-hidden="true" />
          </div>

          <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-blue-400">
            Offer no longer available
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#F8FAFC] sm:text-4xl">
            {title}
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            This promotional offer is no longer available because its
            promotional period has ended. You can explore our current offers to
            see what is available.
          </p>

          {formattedExpiredAt && (
            <p className="mt-4 text-sm text-slate-500">
              Offer ended on{" "}
              <span className="text-slate-400">{formattedExpiredAt}</span>
            </p>
          )}

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/offers"
              className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto"
            >
              View current offers
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Havenstone
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
