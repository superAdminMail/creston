type PreviewUser = {
  name: string;
  email: string;
  role: string;
  status: string;
  balance: string;
};

const previewUsers: PreviewUser[] = [
  {
    name: "Amara Okafor",
    email: "amara.okafor@example.com",
    role: "Super Admin",
    status: "Verified",
    balance: "$182,500",
  },
  {
    name: "Daniel Brooks",
    email: "daniel.brooks@example.com",
    role: "Admin",
    status: "Pending Review",
    balance: "$71,000",
  },
  {
    name: "Amina Yusuf",
    email: "amina.yusuf@example.com",
    role: "User",
    status: "Suspended",
    balance: "$8,500",
  },
];

const previewStats = [
  {
    label: "Preview users",
    value: String(previewUsers.length),
    tone: "emerald",
  },
  {
    label: "Verified",
    value: "2",
    tone: "amber",
  },
  {
    label: "Managed funds",
    value: "$261,000",
    tone: "orange",
  },
] as const;

export default function SuperAdminUsersPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2.25rem] border border-emerald-300/60 bg-[linear-gradient(135deg,rgba(236,253,245,0.98)_0%,rgba(254,243,199,0.96)_50%,rgba(255,237,213,0.98)_100%)] p-5 text-slate-950 shadow-[0_28px_80px_rgba(120,53,15,0.14)] dark:border-emerald-400/20 dark:bg-[linear-gradient(135deg,rgba(9,16,13,0.98)_0%,rgba(27,20,10,0.98)_52%,rgba(44,24,12,0.98)_100%)] dark:text-stone-50">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(16,185,129,0.9),rgba(245,158,11,0.9),rgba(249,115,22,0.9))]" />
        <div className="absolute -left-10 top-8 h-24 w-24 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-amber-400/15 blur-3xl" />

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                Temporary preview
              </span>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Super Admin Users
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-700 dark:text-stone-300">
                  Hardcoded card layout for temporary isolation. This preview uses
                  a warm green, yellow, and orange palette instead of the
                  previous styling.
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-900 shadow-sm dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
              Hardcoded data
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {previewStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.5rem] border border-white/70 bg-white/90 p-4 shadow-[0_10px_24px_rgba(120,53,15,0.08)] dark:border-white/10 dark:bg-white/[0.05]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-stone-400">
                  {stat.label}
                </p>
                <p
                  className={`mt-3 text-2xl font-semibold tracking-tight ${
                    stat.tone === "emerald"
                      ? "text-emerald-700 dark:text-emerald-300"
                      : stat.tone === "amber"
                        ? "text-amber-700 dark:text-amber-300"
                        : "text-orange-700 dark:text-orange-300"
                  }`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-[1.75rem] border border-amber-200/70 bg-white/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-amber-400/15 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between gap-3 border-b border-amber-200/70 pb-4 dark:border-amber-400/15">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                  User preview
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                  Sample directory card
                </h2>
              </div>

              <div className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
                3 records
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {previewUsers.map((user, index) => (
                <article
                  key={user.email}
                  className="flex flex-col gap-3 rounded-[1.4rem] border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.98),rgba(236,253,245,0.96))] p-4 shadow-[0_12px_26px_rgba(120,53,15,0.08)] dark:border-amber-400/15 dark:bg-[linear-gradient(135deg,rgba(28,17,7,0.96),rgba(10,16,13,0.96))]"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300 bg-emerald-100 text-xs font-semibold text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="truncate text-base font-semibold text-slate-950 dark:text-white">
                          {user.name}
                        </h3>
                      </div>
                      <p className="truncate text-sm text-slate-600 dark:text-stone-300">
                        {user.email}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
                        {user.role}
                      </span>
                      <span className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                        {user.status}
                      </span>
                      <span className="inline-flex rounded-full border border-orange-300 bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-900 dark:border-orange-400/20 dark:bg-orange-400/10 dark:text-orange-100">
                        Balance {user.balance}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
