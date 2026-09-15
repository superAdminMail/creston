import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarClock } from "lucide-react";

type OfferUpcomingProps = {
  title?: string;
  startsAt?: Date | string | null;
};

export default function OfferUpcoming({
  title = "This offer is coming soon",
  startsAt,
}: OfferUpcomingProps) {
  const formattedStartsAt = startsAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(startsAt))
    : null;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <section className="w-full max-w-3xl overflow-hidden rounded-3xl border bg-card shadow-2xl">
        <div className="px-6 py-12 text-center sm:px-10 sm:py-16">
          <div className="mx-auto mb-7 flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <CalendarClock className="size-8 text-primary" aria-hidden="true" />
          </div>

          <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-primary">
            Coming soon
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            This offer is not available yet. The promotional period has not
            started, but you can check back when the offer becomes available.
          </p>

          {formattedStartsAt && (
            <p className="mt-4 text-sm text-muted-foreground">
              Available from{" "}
              <span className="font-medium text-foreground">
                {formattedStartsAt}
              </span>
            </p>
          )}

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/offers"
              className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 sm:w-auto"
            >
              View other offers
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border bg-background px-6 text-sm font-medium shadow-sm transition hover:bg-muted sm:w-auto"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to Havenstone
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
