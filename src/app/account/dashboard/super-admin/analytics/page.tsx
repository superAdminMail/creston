import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  CreditCard,
  DollarSign,
  LineChart,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

type MetricCard = {
  title: string;
  value: string;
  change: string;
  direction: "up" | "down" | "neutral";
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
};

type TrendPoint = {
  label: string;
  value: number;
};

type BreakdownRow = {
  label: string;
  value: string;
  helper?: string;
};

const topMetrics: MetricCard[] = [
  {
    title: "Total assets under management",
    value: "$12.84M",
    change: "+8.4%",
    direction: "up",
    helper: "Combined value across investment and savings balances.",
    icon: Wallet,
  },
  {
    title: "Gross funded volume",
    value: "$4.26M",
    change: "+12.1%",
    direction: "up",
    helper: "Total successful funding volume over the selected period.",
    icon: DollarSign,
  },
  {
    title: "Investment inflows",
    value: "$2.91M",
    change: "+6.8%",
    direction: "up",
    helper: "Confirmed capital allocated into investment orders.",
    icon: TrendingUp,
  },
  {
    title: "Savings inflows",
    value: "$1.35M",
    change: "+15.7%",
    direction: "up",
    helper: "Confirmed savings deposits credited to user accounts.",
    icon: PiggyBank,
  },
  {
    title: "Active investors",
    value: "4,218",
    change: "+4.2%",
    direction: "up",
    helper: "Users with active funded investment or savings activity.",
    icon: Users,
  },
  {
    title: "New verified users",
    value: "328",
    change: "-2.3%",
    direction: "down",
    helper: "Freshly verified users within the current reporting window.",
    icon: UserPlus,
  },
  {
    title: "Payment success rate",
    value: "97.9%",
    change: "+0.9%",
    direction: "up",
    helper: "Successful bank and crypto funding completions.",
    icon: CreditCard,
  },
  {
    title: "KYC approval rate",
    value: "92.6%",
    change: "+1.4%",
    direction: "up",
    helper: "Verification approvals across completed KYC reviews.",
    icon: ShieldCheck,
  },
];

const revenueTrend: TrendPoint[] = [
  { label: "Jan", value: 180 },
  { label: "Feb", value: 220 },
  { label: "Mar", value: 260 },
  { label: "Apr", value: 245 },
  { label: "May", value: 310 },
  { label: "Jun", value: 355 },
  { label: "Jul", value: 390 },
  { label: "Aug", value: 420 },
  { label: "Sep", value: 460 },
  { label: "Oct", value: 510 },
  { label: "Nov", value: 565 },
  { label: "Dec", value: 620 },
];

const fundingTrend: TrendPoint[] = [
  { label: "Mon", value: 42 },
  { label: "Tue", value: 56 },
  { label: "Wed", value: 61 },
  { label: "Thu", value: 58 },
  { label: "Fri", value: 73 },
  { label: "Sat", value: 39 },
  { label: "Sun", value: 31 },
];

const investmentBreakdown: BreakdownRow[] = [
  {
    label: "Stocks",
    value: "$1.04M",
    helper: "36% of confirmed investment inflows",
  },
  {
    label: "Crypto",
    value: "$892K",
    helper: "31% of confirmed investment inflows",
  },
  {
    label: "ETFs",
    value: "$514K",
    helper: "18% of confirmed investment inflows",
  },
  {
    label: "Bonds",
    value: "$292K",
    helper: "10% of confirmed investment inflows",
  },
  {
    label: "Commodities",
    value: "$172K",
    helper: "5% of confirmed investment inflows",
  },
];

const operationsBreakdown: BreakdownRow[] = [
  { label: "Pending investment payments", value: "11" },
  { label: "Pending savings payments", value: "5" },
  { label: "Open support conversations", value: "14" },
  { label: "Pending withdrawals", value: "3" },
  { label: "Failed webhook events", value: "1" },
  { label: "Stale KYC sessions", value: "4" },
];

const userBreakdown: BreakdownRow[] = [
  { label: "Total registered users", value: "8,942" },
  { label: "Verified investor profiles", value: "5,126" },
  { label: "Users with active investments", value: "3,487" },
  { label: "Users with active savings", value: "2,964" },
  { label: "Suspended accounts", value: "18" },
  { label: "Pending email verification", value: "126" },
];

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-[11px] uppercase tracking-[0.28em] text-sky-300/80">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function MetricCardItem({ item }: { item: MetricCard }) {
  const Icon = item.icon;

  const tone =
    item.direction === "up"
      ? "text-emerald-300 bg-emerald-500/10 border-emerald-400/20"
      : item.direction === "down"
        ? "text-rose-300 bg-rose-500/10 border-rose-400/20"
        : "text-slate-300 bg-white/[0.05] border-white/10";

  const TrendIcon =
    item.direction === "up"
      ? ArrowUpRight
      : item.direction === "down"
        ? ArrowDownRight
        : Activity;

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-300">
          <Icon className="h-5 w-5" />
        </div>

        <div
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${tone}`}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {item.change}
        </div>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-300">{item.title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
        {item.value}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{item.helper}</p>
    </div>
  );
}

function MiniBarChart({
  data,
  valueSuffix = "",
}: {
  data: TrendPoint[];
  valueSuffix?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex h-64 items-end gap-3">
      {data.map((point) => {
        const height = `${(point.value / max) * 100}%`;

        return (
          <div
            key={point.label}
            className="flex flex-1 flex-col items-center gap-3"
          >
            <div className="flex h-full w-full items-end">
              <div
                className="w-full rounded-t-2xl bg-gradient-to-t from-sky-600 to-cyan-400/80"
                style={{ height }}
                title={`${point.label}: ${point.value}${valueSuffix}`}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-slate-300">
                {point.label}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {point.value}
                {valueSuffix}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BreakdownList({
  title,
  icon: Icon,
  rows,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  rows: BreakdownRow[];
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-300">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#091327] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-white">{row.label}</p>
              {row.helper ? (
                <p className="mt-1 text-sm text-slate-400">{row.helper}</p>
              ) : null}
            </div>

            <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center">
              <p className="text-lg font-semibold text-white">{row.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SuperAdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#11224d_0%,#071225_45%,#030712_100%)] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-sky-200">
                <BarChart3 className="h-3.5 w-3.5" />
                Super admin analytics
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Platform analytics
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Executive-level visibility into platform growth, inflows,
                payment performance, user health, and operational workload
                across Havenstone.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Reporting window
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  Last 30 days
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-emerald-200">
                <p className="text-xs uppercase tracking-[0.18em] opacity-80">
                  Momentum
                </p>
                <p className="mt-2 text-sm font-semibold">Healthy growth</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <SectionHeader
              eyebrow="Overview"
              title="Key performance metrics"
              description="Core platform-level analytics across capital inflows, user growth, compliance health, and payments."
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {topMetrics.map((item) => (
                <MetricCardItem key={item.title} item={item} />
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
              <SectionHeader
                eyebrow="Revenue"
                title="Monthly platform revenue trend"
                description="Illustrative monthly revenue pattern across platform fees, spreads, and payment-related income."
              />

              <MiniBarChart data={revenueTrend} valueSuffix="k" />
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
              <SectionHeader
                eyebrow="Funding"
                title="Daily confirmed funding activity"
                description="Illustrative daily confirmation volume across bank and crypto funding activity."
              />

              <MiniBarChart data={fundingTrend} />
            </div>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-3">
            <BreakdownList
              title="Investment inflow mix"
              icon={LineChart}
              rows={investmentBreakdown}
            />
            <BreakdownList
              title="Operational queue snapshot"
              icon={BadgeDollarSign}
              rows={operationsBreakdown}
            />
            <BreakdownList
              title="User and compliance base"
              icon={Users}
              rows={userBreakdown}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
