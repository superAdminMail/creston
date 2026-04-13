import { Skeleton } from "@/components/ui/skeleton";
import CardSkeleton from "./CardSkeleton";

function SectionShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative scroll-mt-32 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

function HeadingSkeleton({
  eyebrow = "w-36",
  title = "w-[28rem]",
  description = "w-[32rem]",
  center = false,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <Skeleton className={`h-4 ${eyebrow} bg-white/10`} />
      <Skeleton className={`mt-4 h-11 ${title} bg-white/10`} />
      <Skeleton className={`mt-5 h-6 ${description} bg-white/10`} />
    </div>
  );
}

function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[#050B1F]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-18 sm:px-6 md:py-22 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8 lg:py-22">
        <div className="max-w-2xl space-y-6">
          <Skeleton className="h-9 w-64 rounded-full bg-white/10" />
          <Skeleton className="h-[72px] w-full bg-white/10 sm:h-[96px] lg:h-[112px]" />
          <Skeleton className="h-6 w-11/12 bg-white/10" />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-[52px] w-40 rounded-2xl bg-white/10" />
            <Skeleton className="h-[52px] w-36 rounded-2xl bg-white/10" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-[148px] rounded-2xl bg-white/10" />
            <Skeleton className="h-[148px] rounded-2xl bg-white/10" />
            <Skeleton className="h-[148px] rounded-2xl bg-white/10" />
          </div>
        </div>

        <div className="relative mt-10 lg:mt-0">
          <div className="absolute inset-0 rounded-[2rem] bg-blue-500/10 blur-2xl" />
          <div className="relative rounded-[2rem] border border-white/10 bg-[rgba(15,23,42,0.9)] p-5 shadow-xl backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16 bg-white/10" />
                <Skeleton className="h-4 w-24 bg-white/10" />
              </div>
              <Skeleton className="h-3 w-12 bg-white/10" />
            </div>

            <div className="mt-5">
              <Skeleton className="h-4 w-20 bg-white/10" />
              <Skeleton className="mt-2 h-10 w-44 bg-white/10" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Skeleton className="h-12 rounded-xl bg-white/10" />
              <Skeleton className="h-12 rounded-xl bg-white/10" />
              <Skeleton className="h-12 rounded-xl bg-white/10" />
              <Skeleton className="h-12 rounded-xl bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhySkeleton() {
  return (
    <SectionShell className="py-20 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <HeadingSkeleton
          eyebrow="w-28"
          title="w-[30rem]"
          description="w-[34rem]"
        />

        <div className="grid gap-5">
          <CardSkeleton variant="benefit-primary" className="bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(15,23,42,0.96))]" />
          <div className="grid gap-5 sm:grid-cols-2">
            <CardSkeleton variant="benefit-secondary" />
            <CardSkeleton variant="benefit-secondary" />
          </div>
          <div className="rounded-[1.7rem] border border-white/8 bg-white/[0.03] p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-11 w-11 rounded-2xl bg-white/10" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 bg-white/10" />
                <Skeleton className="mt-2 h-4 w-full bg-white/10" />
                <Skeleton className="mt-2 h-4 w-11/12 bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function ProductsSkeleton() {
  return (
    <SectionShell className="py-20 sm:py-24">
      <div className="space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <HeadingSkeleton
            eyebrow="w-40"
            title="w-[28rem]"
            description="w-[32rem]"
          />
          <Skeleton className="h-11 w-36 rounded-2xl bg-white/10" />
        </div>

        <div className="group relative mt-12">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <CardSkeleton variant="product" />
            <CardSkeleton variant="product" />
            <CardSkeleton variant="product" />
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Skeleton className="h-2.5 w-8 rounded-full bg-white/10" />
            <Skeleton className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <Skeleton className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>

          <div className="mt-8 flex justify-end">
            <Skeleton className="h-4 w-40 bg-white/10" />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function PlansSkeleton() {
  return (
    <SectionShell className="py-20 sm:py-24">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <HeadingSkeleton
          eyebrow="w-52"
          title="w-[26rem]"
          description="w-[34rem]"
        />
        <Skeleton className="h-11 w-36 rounded-2xl bg-white/10" />
      </div>

      <div className="group relative mt-12">
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <CardSkeleton variant="plan" />
          <CardSkeleton variant="plan" />
          <CardSkeleton variant="plan" />
        </div>

        <div className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 rounded-full bg-white/10 lg:block" />
        <div className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 rounded-full bg-white/10 lg:block" />
      </div>

      <Skeleton className="mx-auto mt-6 h-4 w-56 bg-white/10" />
    </SectionShell>
  );
}

function HowItWorksSkeleton() {
  return (
    <SectionShell className="py-20 sm:py-24">
      <div className="rounded-[2.2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(8,17,37,0.98))] px-6 py-10 shadow-[0_28px_70px_rgba(0,0,0,0.28)] sm:px-10">
        <HeadingSkeleton
          eyebrow="w-32"
          title="w-[28rem]"
          description="w-[34rem]"
        />
        <div className="relative mt-14 hidden lg:block">
          <div className="grid grid-cols-4 gap-6">
            <CardSkeleton variant="how-step" />
            <CardSkeleton variant="how-step" />
            <CardSkeleton variant="how-step" />
            <CardSkeleton variant="how-step" />
          </div>
        </div>
        <div className="relative mt-10 grid gap-4 lg:hidden">
          <CardSkeleton variant="how-step" />
          <CardSkeleton variant="how-step" />
          <CardSkeleton variant="how-step" />
          <CardSkeleton variant="how-step" />
        </div>

        <div className="mt-10 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
          <Skeleton className="h-4 w-48 bg-white/10" />
          <Skeleton className="mt-4 h-4 w-full bg-white/10" />
          <Skeleton className="mt-2 h-4 w-11/12 bg-white/10" />
          <div className="mt-4 flex flex-wrap gap-3">
            <Skeleton className="h-8 w-32 rounded-full bg-white/10" />
            <Skeleton className="h-8 w-36 rounded-full bg-white/10" />
            <Skeleton className="h-8 w-28 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function BenefitsSkeleton() {
  return (
    <SectionShell className="py-20 sm:py-24">
      <HeadingSkeleton
        eyebrow="w-24"
        title="w-[30rem]"
        description="w-[34rem]"
      />
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(15,23,42,0.96))] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 bg-white/10" />
            <Skeleton className="h-6 w-56 bg-white/10" />
          </div>
          <CardSkeleton variant="benefit-primary" className="mt-7 bg-white/10" />
          <div className="mt-6 grid gap-4">
            <CardSkeleton variant="benefit-secondary" />
            <CardSkeleton variant="benefit-secondary" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(8,17,37,0.98))] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 bg-white/10" />
            <Skeleton className="h-6 w-56 bg-white/10" />
          </div>
          <CardSkeleton variant="benefit-primary" className="mt-7 bg-white/10" />
          <div className="mt-6 grid gap-4">
            <CardSkeleton variant="benefit-secondary" />
            <CardSkeleton variant="benefit-secondary" />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function TestimonialsSkeleton() {
  return (
    <SectionShell className="py-20 sm:py-24">
      <HeadingSkeleton
        eyebrow="w-32"
        title="w-[28rem]"
        description="w-[30rem]"
        center
      />

      <div className="relative mt-12 group">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton variant="testimonial" />
          <CardSkeleton variant="testimonial" />
          <CardSkeleton variant="testimonial" />
        </div>

        <Skeleton className="absolute left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-white/10 lg:block" />
        <Skeleton className="absolute right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-white/10 lg:block" />
      </div>
    </SectionShell>
  );
}

function FaqSkeleton() {
  return (
    <SectionShell className="py-20 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <HeadingSkeleton
          eyebrow="w-24"
          title="w-[26rem]"
          description="w-[30rem]"
        />

        <div className="space-y-6">
          <CardSkeleton variant="faq" className="rounded-[2rem] border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(15,23,42,0.96))] p-6" />
          <div className="grid gap-4">
            <CardSkeleton variant="faq" />
            <CardSkeleton variant="faq" />
            <CardSkeleton variant="faq" />
          </div>
          <CardSkeleton variant="cta" />
        </div>
      </div>
    </SectionShell>
  );
}

function ManagementSkeleton() {
  return (
    <SectionShell className="relative overflow-hidden py-20 sm:py-24">
      <div className="absolute inset-0">
        <div className="absolute left-1/3 top-[-120px] h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[10%] h-[350px] w-[350px] rounded-full bg-blue-400/20 blur-3xl" />
      </div>

      <div className="relative z-10">
        <HeadingSkeleton
          eyebrow="w-36"
          title="w-[34rem]"
          description="w-[34rem]"
          center
        />

        <div className="mt-16">
          <div className="flex flex-col items-center gap-6 sm:gap-8 md:hidden">
            <CardSkeleton variant="management" />
            <div className="flex flex-col items-center gap-6">
              <CardSkeleton variant="management" />
              <CardSkeleton variant="management" />
            </div>
          </div>

          <div className="relative hidden h-[420px] md:block lg:hidden">
            <div className="absolute left-[10%] top-[65%] -translate-y-1/2 scale-[0.9] opacity-80">
              <CardSkeleton variant="management" />
            </div>
            <div className="absolute right-[10%] top-[65%] -translate-y-1/2 scale-[0.9] opacity-80">
              <CardSkeleton variant="management" />
            </div>
            <div className="absolute left-1/2 top-[50%] z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="absolute inset-0 rounded-[2rem] bg-blue-500/20 blur-2xl" />
                <CardSkeleton variant="management" className="border-blue-400/25 bg-[#0f172a] shadow-[0_36px_90px_rgba(0,0,0,0.42)] ring-1 ring-blue-400/10" />
              </div>
            </div>
          </div>

          <div className="relative hidden h-[480px] lg:block">
            <div className="absolute left-[8%] top-[60%] -translate-y-1/2 scale-[0.92] opacity-75 blur-[0.5px]">
              <CardSkeleton variant="management" />
            </div>
            <div className="absolute right-[8%] top-[60%] -translate-y-1/2 scale-[0.92] opacity-75 blur-[0.5px]">
              <CardSkeleton variant="management" />
            </div>
            <div className="absolute left-1/2 top-[45%] z-20 -translate-x-1/2 -translate-y-1/2">
              <div className="absolute inset-0 rounded-[2rem] bg-blue-500/20 blur-2xl" />
              <CardSkeleton variant="management" className="border-blue-400/25 bg-[#0f172a] shadow-[0_36px_90px_rgba(0,0,0,0.42)] ring-1 ring-blue-400/10" />
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function FinalCtaSkeleton() {
  return (
    <SectionShell className="py-20 sm:py-24">
      <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(8,17,37,0.98))] px-6 py-12 shadow-[0_30px_80px_rgba(0,0,0,0.32)] sm:px-10 lg:px-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-6">
            <Skeleton className="h-4 w-32 bg-white/10" />
            <Skeleton className="h-11 w-[30rem] bg-white/10" />
            <Skeleton className="h-6 w-[34rem] bg-white/10" />
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-8 w-20 rounded-full bg-white/10" />
              <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
              <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Skeleton className="h-12 w-40 rounded-2xl bg-white/10" />
            <Skeleton className="h-12 w-40 rounded-2xl bg-white/10" />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export default function HomeSkeleton() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#050B1F] text-white">
      <HeroSkeleton />
      <WhySkeleton />
      <ProductsSkeleton />
      <PlansSkeleton />
      <HowItWorksSkeleton />
      <BenefitsSkeleton />
      <TestimonialsSkeleton />
      <FaqSkeleton />
      <ManagementSkeleton />
      <FinalCtaSkeleton />
    </div>
  );
}
