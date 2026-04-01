import { ArrowUpRight, BadgeCheck, Landmark, ShieldCheck } from "lucide-react";

const accountMetrics = [
  {
    label: "Portfolio outlook",
    value: "$184,200",
    detail: "Structured long-term growth visibility",
  },
  {
    label: "Contribution status",
    value: "On track",
    detail: "Recent contributions are processing normally",
  },
  {
    label: "Verification",
    value: "In review",
    detail: "Identity checks are being reviewed securely",
  },
];

const trustNotes = [
  {
    icon: Landmark,
    title: "Personal retirement structure",
    description:
      "Monitor personal retirement progress with a calm interface designed for long-term planning.",
  },
  {
    icon: BadgeCheck,
    title: "Clear verification flow",
    description:
      "Track profile completion and KYC progress through one consistent account experience.",
  },
  {
    icon: ShieldCheck,
    title: "Secure account access",
    description:
      "Every surface is designed to feel measured, private, and dependable.",
  },
];

export default function UserDashboardPage() {
  return (
    <section className="space-y-6 pb-8 pt-1 lg:space-y-7">
      <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(11,18,41,0.98))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.24)] sm:p-7 lg:p-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-blue-200 uppercase">
              Havenstone account
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Welcome back, User.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              View your investment activity, monitor account progress, and
              manage verification from a calm, premium dashboard built for
              long-term confidence.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/10 px-4 py-2 text-sm text-blue-100">
            <span>Account health is stable</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accountMetrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(11,18,41,0.96))] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.16)]"
          >
            <p className="text-sm text-slate-400">{metric.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
              {metric.value}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {metric.detail}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {trustNotes.map((note) => {
          const Icon = note.icon;

          return (
            <article
              key={note.title}
              className="rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(11,18,41,0.96))] p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(37,99,235,0.22),rgba(59,130,246,0.06))]">
                <Icon className="h-5 w-5 text-blue-200" />
              </div>

              <h2 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-white">
                {note.title}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {note.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
