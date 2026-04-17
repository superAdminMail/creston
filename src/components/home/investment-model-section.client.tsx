"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type * as React from "react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionShell } from "@/components/home/section-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type ModelCardIcon = "PiggyBank" | "LockKeyhole" | "TrendingUp";

type ModelCard = {
  key: string;
  title: string;
  eyebrow: string;
  href: string;
  iconKey: ModelCardIcon;
  bgImage: string;
  description: string;
  bullets: string[];
  bestFor: string;
  approach: string;
  accent: string;
  glow: string;
};

const iconMap = {
  PiggyBank,
  LockKeyhole,
  TrendingUp,
} satisfies Record<ModelCardIcon, React.ComponentType<{ className?: string }>>;

export function InvestmentModelSectionClient({
  siteName,
  cards,
}: {
  siteName: string;
  cards: ModelCard[];
}) {
  const [api, setApi] = useState<CarouselApi>();

  return (
    <SectionShell
      id="investment-models"
      className="relative overflow-hidden py-20 sm:py-24"
    >
      <div className="absolute inset-0">
        <div className="absolute left-[-8%] top-[-10%] h-72 w-72 rounded-full bg-blue-500/12 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_35%)]" />
      </div>

      <div className="relative z-10">
        <SectionHeading
          eyebrow="Investment Models & Savings"
          title="Choose the path that matches your financial strategy"
          description={`${siteName} brings together structured investing and disciplined savings in one secure platform.`}
          align="center"
        />

        <div className="relative mt-14 group">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: cards.length > 1,
            }}
          >
            <CarouselContent>
              {cards.map((item, index) => {
                const Icon = iconMap[item.iconKey];

                return (
                  <CarouselItem
                    key={item.key}
                    className="md:basis-1/2 lg:basis-1/2 xl:basis-1/3"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 22 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ duration: 0.45, delay: index * 0.08 }}
                      className="h-full px-2"
                    >
                      <Link
                        href={item.href}
                        className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
                      >
                        <Card
                          className={cn(
                            "relative h-full min-h-[520px] overflow-hidden border border-white/10 bg-[linear-gradient(180deg,rgba(8,17,37,0.96),rgba(5,11,31,0.985))] shadow-[0_25px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl transition-all duration-300",
                            "group-hover:-translate-y-1.5 group-hover:border-blue-400/20 group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.42)]",
                          )}
                        >
                          <div className="absolute inset-0 overflow-hidden">
                            <img
                              src={item.bgImage}
                              alt={item.title}
                              className="h-full w-full object-cover opacity-[0.28] transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>

                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,31,0.55)_0%,rgba(5,11,31,0.75)_100%)]" />
                          <div
                            className={cn(
                              "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-30 transition-opacity duration-300 group-hover:opacity-40",
                              item.accent,
                            )}
                          />

                          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(96,165,250,0.42),transparent)]" />

                          <div
                            className={cn(
                              "pointer-events-none absolute -right-10 top-8 h-32 w-32 rounded-full blur-3xl transition-transform duration-300 group-hover:scale-110",
                              item.glow,
                            )}
                          />

                          <CardHeader className="relative space-y-0 p-5 sm:p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-2.5">
                                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-blue-200">
                                  {item.eyebrow}
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] shadow-inner shadow-white/5">
                                    <Icon className="h-5 w-5 text-blue-300" />
                                  </div>

                                  <CardTitle className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                                    {item.title}
                                  </CardTitle>
                                </div>
                              </div>

                              <div className="rounded-full border border-white/10 bg-white/[0.05] p-2.5 transition-transform duration-300 group-hover:translate-x-1">
                                <ArrowRight className="h-4 w-4 text-slate-200" />
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="relative px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
                            <p className="max-w-xl text-sm leading-6 text-slate-300 sm:text-[14px]">
                              {item.description}
                            </p>

                            <div className="mt-4 grid gap-2.5">
                              {item.bullets.map((bullet) => (
                                <div
                                  key={bullet}
                                  className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-2.5"
                                >
                                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
                                  <span className="text-[13px] leading-6 text-slate-200">
                                    {bullet}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <div className="rounded-2xl border border-white/8 bg-[#0B132B]/80 p-3.5">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <BarChart3 className="h-4 w-4 text-blue-300" />
                                  <span className="text-xs uppercase tracking-[0.18em]">
                                    Best for
                                  </span>
                                </div>
                                <p className="mt-2.5 text-sm font-medium text-white">
                                  {item.bestFor}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-white/8 bg-[#0B132B]/80 p-3.5">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <TrendingUp className="h-4 w-4 text-blue-300" />
                                  <span className="text-xs uppercase tracking-[0.18em]">
                                    Approach
                                  </span>
                                </div>
                                <p className="mt-2.5 text-sm font-medium text-white">
                                  {item.approach}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 pt-1">
                              <span className="inline-flex items-center gap-2 text-sm font-medium text-blue-200 transition-colors group-hover:text-white">
                                Explore {item.title}
                                <ArrowRight className="h-4 w-4" />
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>

          <button
            onClick={() => api?.scrollPrev()}
            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 transition group-hover:opacity-100"
            aria-label="Previous model card"
          >
            <ChevronLeft className="h-8 w-8 text-white/70 hover:text-white" />
          </button>

          <button
            onClick={() => api?.scrollNext()}
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition group-hover:opacity-100"
            aria-label="Next model card"
          >
            <ChevronRight className="h-8 w-8 text-white/70 hover:text-white" />
          </button>
        </div>
      </div>
    </SectionShell>
  );
}
