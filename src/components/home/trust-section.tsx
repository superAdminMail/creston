import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { getPublicTestimonials } from "@/lib/service/getPublicTestimonials";
import TrustSectionClient from "@/components/home/trust-section.client";

export async function TrustSection() {
  const [site, testimonials] = await Promise.all([
    getSiteSeoConfig(),
    getPublicTestimonials(),
  ]);

  if (testimonials.length === 0) {
    return (
      <section id="trust" className="relative scroll-mt-32 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-[#0b1120]/90 p-8 text-center text-sm text-slate-400">
            We are collecting more {site.siteName} testimonials. Please check
            back shortly.
          </div>
        </div>
      </section>
    );
  }

  return (
    <TrustSectionClient
      siteName={site.siteName}
      testimonial={testimonials[0]}
    />
  );
}
