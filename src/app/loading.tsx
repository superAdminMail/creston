import Image from "next/image";

import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

export default async function Loading() {
  const config = await getSiteConfigurationCached();
  const siteName = config?.siteName?.trim() || "Havenstone";
  const siteTagline =
    config?.siteTagline?.trim() || "Securing your financial future";
  const logoUrl = config?.siteLogoFileAsset?.url ?? null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050B1F]">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.14),transparent_38%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent)]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Pulse rings */}
        <div className="relative flex items-center justify-center">
          <span className="absolute h-36 w-36 rounded-full border border-blue-400/20 animate-ping" />
          <span
            className="absolute h-48 w-48 rounded-full border border-sky-300/10"
            style={{ animation: "softPulse 2.8s ease-out infinite" }}
          />
          <span
            className="absolute h-64 w-64 rounded-full border border-white/5"
            style={{ animation: "softPulse 3.6s ease-out infinite" }}
          />

          {/* Logo card */}
          <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-400/20 via-transparent to-sky-300/20" />
            <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] border border-white/5" />
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${siteName} logo`}
                fill
                className="relative rounded-[2rem] object-cover p-3"
                sizes="112px"
              />
            ) : (
              <span className="relative text-4xl font-semibold tracking-[0.22em] text-white">
                {siteName.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Brand text */}
        <div className="mt-8 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.45em] text-blue-200/80">
            {siteName}
          </p>
          <p className="mt-3 text-sm text-slate-400">
            {siteTagline}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes softPulse {
          0% {
            transform: scale(0.82);
            opacity: 0.18;
          }
          60% {
            transform: scale(1);
            opacity: 0.06;
          }
          100% {
            transform: scale(1.12);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
