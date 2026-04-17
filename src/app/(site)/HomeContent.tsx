import { HeroSection } from "@/components/home/Hero-section";
import { ManagementTeamSection } from "@/components/home/Management-team-section";
import { BenefitsSection } from "@/components/home/benefits-section";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCtaSection } from "@/components/home/final-cta-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { ScrollReveal } from "@/components/home/ScrollReveal-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { WhySection } from "@/components/home/why-section";
import { InvestmentModelsSection } from "@/components/home/investment-model-section";

const HomeContent = () => {
  return (
    <>
      <ScrollReveal y={26} duration={0.7} amount={0.15}>
        <HeroSection />
      </ScrollReveal>

      <ScrollReveal duration={0.03}>
        <WhySection />
      </ScrollReveal>

      <ScrollReveal duration={0.05}>
        <InvestmentModelsSection />
      </ScrollReveal>

      <ScrollReveal duration={0.07}>
        <HowItWorksSection />
      </ScrollReveal>
      <ScrollReveal duration={0.09}>
        <BenefitsSection />
      </ScrollReveal>

      <ScrollReveal duration={0.011}>
        <TestimonialsSection />
      </ScrollReveal>

      <ScrollReveal duration={0.013}>
        <FaqSection />
      </ScrollReveal>

      <ScrollReveal duration={0.015}>
        <ManagementTeamSection />
      </ScrollReveal>

      <ScrollReveal duration={0.017}>
        <FinalCtaSection />
      </ScrollReveal>
    </>
  );
};

export default HomeContent;
