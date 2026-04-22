import { ShieldCheck } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionShell } from "@/components/home/section-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";

function buildFaqs(siteName: string) {
  return [
    {
      question: `Who is ${siteName} built for?`,
      answer: `${siteName} is built for anyone who wants to achieve their financial goals. Whether you're a student, working professional, or a retiree, we have a plan that's right for you.`,
      featured: true,
    },
    {
      question: "What returns can I expect?",
      answer:
        "Each plan offers a range of returns, from conservative to aggressive, to meet your individual needs.",
    },
    {
      question: `Is ${siteName} only for investors/investing?`,
      answer: `No, ${siteName} supports a wide range of financial goals, from long-term wealth planning to personal savings so you can pay your bills with confidence.`,
    },
    {
      question: "When can i withdraw my money?",
      answer:
        "Withdrawals are typically available on the next business day after the end of the plan period.",
    },
  ];
}

export async function FaqSection() {
  const site = await getSiteSeoConfig();
  const faqs = buildFaqs(site.siteName);
  const defaultValue = faqs[0]?.question ? [faqs[0].question] : [];

  return (
    <SectionShell id="faq" className="py-20 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        {/* LEFT */}
        <SectionHeading
          eyebrow="FAQ"
          title="Clear answers to common questions"
          description={`Everything you need to understand how ${site.siteName} works, from plan selection to tracking your investment progress.`}
        />

        {/* RIGHT */}
        <div className="space-y-6">
          <Accordion
            type="multiple"
            defaultValue={defaultValue}
            className="grid gap-4"
          >
            {faqs.map((faq) => {
              const isFeatured = faq.featured;

              return (
                <AccordionItem
                  key={faq.question}
                  value={faq.question}
                  className={
                    isFeatured
                      ? "rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(15,23,42,0.96))] px-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
                      : "rounded-[1.7rem] border border-white/8 bg-white/[0.04] px-5 transition hover:border-white/12"
                  }
                >
                  <AccordionTrigger
                    className={
                      isFeatured
                        ? "py-0 text-lg font-semibold text-white hover:no-underline"
                        : "py-0 text-base font-semibold text-white hover:no-underline"
                    }
                  >
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent
                    className={
                      isFeatured
                        ? "mt-4 text-sm leading-7 text-slate-300"
                        : "mt-3 text-sm leading-7 text-slate-400"
                    }
                  >
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* SUPPORT PANEL */}
          <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 px-3 py-3 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(37,99,235,0.22),rgba(59,130,246,0.06))]">
                <ShieldCheck className="h-5 w-5 text-blue-200 shrink-0" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-white">
                  Still have questions?
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Our team can guide you through plan setup, onboarding, and
                  long-term participation.
                </p>

                <a
                  href="/contact"
                  className="mt-4 inline-flex items-center text-sm font-medium text-blue-200 hover:text-white"
                >
                  Contact support →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
