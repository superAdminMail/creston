import { HeroSection } from "@/components/home/Hero-section";
import { InvestmentProductsSection } from "@/components/home/Investment-products-section";
import { ManagementTeamSection } from "@/components/home/Management-team-section";
import { BenefitsSection } from "@/components/home/benefits-section";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCtaSection } from "@/components/home/final-cta-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { InvestmentPlansSection } from "@/components/home/investment-plans-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { WhySection } from "@/components/home/why-section";
import { RevealSection } from "@/components/home/reveal-section";

const HomeContent = () => {
  return (
    <>
      <RevealSection className="delay-0">
        <HeroSection />
      </RevealSection>
      <RevealSection className="delay-100">
        <WhySection />
      </RevealSection>

      <RevealSection className="delay-100">
        <InvestmentProductsSection />
      </RevealSection>
      <RevealSection className="delay-150">
        <InvestmentPlansSection />
      </RevealSection>

      <RevealSection className="delay-150">
        <HowItWorksSection />
      </RevealSection>
      <RevealSection className="delay-150">
        <BenefitsSection />
      </RevealSection>
      <RevealSection className="delay-150">
        <TestimonialsSection />
      </RevealSection>
      <RevealSection className="delay-150">
        <FaqSection />
      </RevealSection>
      <RevealSection className="delay-150">
        <ManagementTeamSection />
      </RevealSection>
      <RevealSection className="delay-150">
        <FinalCtaSection />
      </RevealSection>
    </>
  );
};

export default HomeContent;
