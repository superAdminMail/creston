"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionShell } from "@/components/home/section-shell";

type ManagementTeamMember = {
  id: string;
  name: string;
  role: string;
  description: string;
  photoUrl?: string | null;
  featured?: boolean;
};

export function ManagementTeamSectionClient({
  team,
  brandName,
  brandTagline,
  brandDescription,
}: {
  team: ManagementTeamMember[];
  brandName: string;
  brandTagline: string;
  brandDescription: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const featured = team[activeIndex] ?? team[0];
  const others = team.filter((_, index) => index !== activeIndex).slice(0, 2);

  return (
    <SectionShell id="team" className="relative overflow-hidden py-20 sm:py-24">
      <div className="absolute inset-0">
        <img
          src="https://3mnjvkl4rh.ufs.sh/f/obiqfDxUd1AJER91OtJQdY0fW6Xhc7KoRLHNpBrns9tQ8kJG"
          alt="Background"
          className="h-full w-full scale-105 object-cover brightness-[0.6] contrast-[1.1]"
        />

        <div className="absolute inset-0 bg-[rgba(5,11,31,0.7)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,31,0.9)_0%,rgba(5,11,31,0.7)_40%,rgba(5,11,31,0.95)_100%)]" />

        <div className="absolute inset-0">
          <div className="absolute left-1/3 top-[-120px] h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-[-120px] right-[10%] h-[350px] w-[350px] rounded-full bg-blue-400/20 blur-3xl" />
        </div>
      </div>

      <div className="relative z-10">
        <SectionHeading
          eyebrow="Management Team"
          title={`Built and guided by experienced leadership at ${brandName}`}
          description={`${brandName} is led by a team focused on ${brandTagline.toLowerCase()}. ${brandDescription}`}
          align="center"
        />

        <div className="mt-16">
          <div className="flex flex-col items-center gap-6 sm:gap-8 md:hidden">
            <ManagementCard
              member={featured}
              featured
              onFocus={() => setActiveIndex(activeIndex)}
            />

            <div className="flex flex-col items-center gap-6">
              {others.map((member) => (
                <ManagementCard
                  key={member.id}
                  member={member}
                  onFocus={() =>
                    setActiveIndex(
                      team.findIndex((entry) => entry.id === member.id),
                    )
                  }
                />
              ))}
            </div>
          </div>

          <div className="relative hidden h-[420px] md:block lg:hidden">
            {others[0] ? (
              <div className="absolute left-[10%] top-[65%] -translate-y-1/2 scale-[0.9] opacity-80">
                <ManagementCard
                  member={others[0]}
                  onFocus={() =>
                    setActiveIndex(
                      team.findIndex((entry) => entry.id === others[0].id),
                    )
                  }
                />
              </div>
            ) : null}

            {others[1] ? (
              <div className="absolute right-[10%] top-[65%] -translate-y-1/2 scale-[0.9] opacity-80">
                <ManagementCard
                  member={others[1]}
                  onFocus={() =>
                    setActiveIndex(
                      team.findIndex((entry) => entry.id === others[1].id),
                    )
                  }
                />
              </div>
            ) : null}

            <div className="absolute left-1/2 top-[50%] z-10 -translate-x-1/2 -translate-y-1/2">
              <ManagementCard
                member={featured}
                featured
                onFocus={() => setActiveIndex(activeIndex)}
              />
            </div>
          </div>

          <div className="relative hidden h-[480px] lg:block">
            {others[0] ? (
              <motion.div
                layout="position"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 0.75, x: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                className="absolute left-[8%] top-[60%] -translate-y-1/2 scale-[0.92] blur-[0.5px]"
              >
                <ManagementCard
                  member={others[0]}
                  onFocus={() =>
                    setActiveIndex(
                      team.findIndex((entry) => entry.id === others[0].id),
                    )
                  }
                />
              </motion.div>
            ) : null}

            {others[1] ? (
              <motion.div
                layout="position"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 0.75, x: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                className="absolute right-[8%] top-[60%] -translate-y-1/2 scale-[0.92] blur-[0.5px]"
              >
                <ManagementCard
                  member={others[1]}
                  onFocus={() =>
                    setActiveIndex(
                      team.findIndex((entry) => entry.id === others[1].id),
                    )
                  }
                />
              </motion.div>
            ) : null}

            <motion.div
              layout="position"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="absolute left-1/2 top-[45%] z-20 -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-[2rem] bg-blue-500/20 blur-2xl"
              />

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <ManagementCard
                  member={featured}
                  featured
                  onFocus={() => setActiveIndex(activeIndex)}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function ManagementCard({
  member,
  featured = false,
  onFocus,
}: {
  member: ManagementTeamMember;
  featured?: boolean;
  onFocus?: () => void;
}) {
  return (
    <motion.div
      layout="position"
      onMouseEnter={onFocus}
      onClick={onFocus}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`relative w-[260px] cursor-pointer rounded-[2rem] border p-5 text-center transition-all duration-300 ease-out sm:w-[300px] sm:p-6 ${
        featured
          ? "border-blue-400/25 bg-[#0f172a] shadow-[0_36px_90px_rgba(0,0,0,0.42)] ring-1 ring-blue-400/10"
          : "border-white/8 bg-[linear-gradient(180deg,rgba(10,16,30,0.96),rgba(5,11,24,1))] opacity-90"
      }`}
    >
      {featured ? (
        <div className="absolute inset-0 rounded-[2rem] bg-blue-500/20 blur-2xl" />
      ) : null}

      <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-blue-500/20 sm:h-20 sm:w-20">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-white sm:text-xl">
            {member.name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </div>
        )}
      </div>

      <h3 className="mt-4 text-base font-semibold text-white sm:mt-5 sm:text-lg">
        {member.name}
      </h3>

      <p className="mt-1 text-xs text-blue-200 sm:text-sm">{member.role}</p>

      <p className="mt-3 text-xs leading-6 text-slate-400 sm:mt-4 sm:text-sm sm:leading-7">
        {member.description}
      </p>
    </motion.div>
  );
}
