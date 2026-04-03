import { ChevronRight } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionShell } from "@/components/home/section-shell";

const faqs = [
  {
    answer:
      "Havenstone is designed for retirement and investment programs that need a stable, premium member experience with clear contribution and account visibility.",
    question: "Who is Havenstone built for?",
  },
  {
    answer:
      "The platform emphasizes transparent contribution records, clear account context, and secure access patterns that support long-term financial confidence.",
    question: "What makes the experience feel trustworthy?",
  },
  {
    answer:
      "Yes. Havenstone is structured to serve employer-backed programs where institutional clarity and member confidence are equally important.",
    question: "Can employers use Havenstone for workforce retirement programs?",
  },
  {
    answer:
      "The product focuses on organized visibility into contributions, account development, and program participation so members can follow progress without unnecessary complexity.",
    question: "What can members see inside the platform?",
  },
];

export function FaqSection() {
  return (
    <SectionShell id="faq" className="py-20 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Havenstone is designed to feel secure, transparent, and dependable at every stage of growth. Here are answers to some common questions about the platform and experience."
        />

        <div className="grid gap-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.86),rgba(11,18,41,0.98))] p-6"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
                <span className="text-base font-semibold text-white">
                  {faq.question}
                </span>
                <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-blue-200 transition group-open:rotate-90" />
              </summary>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
