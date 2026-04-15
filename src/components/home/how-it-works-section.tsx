import { LineChart, PiggyBank, ShieldCheck, Wallet } from "lucide-react";

import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionShell } from "@/components/home/section-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  {
    icon: ShieldCheck,
    step: "01",
    title: "Complete onboarding and verification",
    description:
      "Create your account, confirm your identity, and finish the compliance steps needed before you can open accounts or fund anything.",
  },
  {
    icon: PiggyBank,
    step: "02",
    title: "Open a savings or investment account",
    description:
      "Choose the account type that fits your goal. Savings accounts keep cash available, while investment accounts track plan-based capital separately.",
  },
  {
    icon: Wallet,
    step: "03",
    title: "Fund the right account",
    description:
      "Deposit into savings or place capital into an investment order. Each transaction is recorded against the correct account and stays easy to review.",
  },
  {
    icon: LineChart,
    step: "04",
    title: "Track balances and returns",
    description:
      "Watch balances, interest, earnings, and account performance from your dashboard, with support available whenever you need help.",
  },
] as const;

export async function HowItWorksSection() {
  const site = await getSiteConfigurationCached();
  const siteName = site?.siteName?.trim() || "Havenstone";
  const siteTagline =
    site?.siteTagline?.trim() ||
    "Invest for the long term, achieve financial security.";
  const supportEmail = site?.supportEmail?.trim() || "support@example.com";

  return (
    <SectionShell id="how-it-works" className="py-20 sm:py-24">
      <div className="rounded-[2.2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(8,17,37,0.98))] px-6 py-10 shadow-[0_28px_70px_rgba(0,0,0,0.28)] sm:px-10">
        <SectionHeading
          eyebrow="How It Works"
          title={`How ${siteName} onboarding works`}
          description={`${siteName} keeps the process straightforward: verify your profile, open the account you need, fund it, and track everything in one place.`}
        />

        {/* DESKTOP TIMELINE */}
        <div className="relative mt-14 hidden lg:block">
          <div className="absolute left-0 top-8 h-[2px] w-full bg-white/10" />

          <div className="grid grid-cols-4 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="relative">
                  <div className="absolute left-0 top-7 z-10 h-4 w-4 rounded-full bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]" />

                  <Card className="ml-6 flex h-full min-h-[300px] border-white/8 bg-white/[0.04] shadow-none">
                    <CardHeader className="space-y-0 pb-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.2em] text-blue-200">
                          Step {step.step}
                        </span>

                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(37,99,235,0.2),rgba(59,130,246,0.05))]">
                          <Icon className="h-5 w-5 text-blue-200" />
                        </div>
                      </div>
                      <CardTitle className="mt-6 text-lg font-semibold text-white">
                        {step.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-1 pt-3">
                      <CardDescription className="line-clamp-5 text-sm leading-7 text-slate-400">
                        {step.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* MOBILE TIMELINE */}
        <div className="relative mt-10 grid gap-4 lg:hidden">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <Card
                key={step.title}
                className="flex min-h-[260px] border-white/8 bg-white/[0.04] shadow-none"
              >
                <CardHeader className="space-y-0 pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.2em] text-blue-200">
                      Step {step.step}
                    </span>

                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(37,99,235,0.2),rgba(59,130,246,0.05))]">
                      <Icon className="h-5 w-5 text-blue-200" />
                    </div>
                  </div>
                  <CardTitle className="mt-6 text-lg font-semibold text-white">
                    {step.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-1 pt-3">
                  <CardDescription className="line-clamp-5 text-sm leading-7 text-slate-400">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5 text-sm text-slate-300">
          <p className="leading-7">
            Need help getting started? Reach the support team at{" "}
            <span className="text-white">{supportEmail}</span> and they’ll help
            you move through onboarding, account setup, and funding.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
            <span className="rounded-full border border-white/8 px-3 py-2">
              Savings accounts
            </span>
            <span className="rounded-full border border-white/8 px-3 py-2">
              Investment accounts
            </span>
            <span className="rounded-full border border-white/8 px-3 py-2">
              Verification
            </span>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
