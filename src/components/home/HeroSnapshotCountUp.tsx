"use client";

import { useLayoutEffect, useMemo, useState } from "react";

import { formatCompactUsd } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";

type HeroSnapshotCountUpProps = {
  value: number;
  step: number;
  durationMs?: number;
  delayMs?: number;
  variant: "currency" | "investors";
  className?: string;
};

function abbreviateCount(value: number) {
  const absoluteValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absoluteValue >= 1_000_000) {
    return `${sign}${(absoluteValue / 1_000_000).toFixed(absoluteValue >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}m`;
  }

  if (absoluteValue >= 1_000) {
    return `${sign}${(absoluteValue / 1_000).toFixed(absoluteValue >= 10_000 ? 0 : 1).replace(/\.0$/, "")}k`;
  }

  return `${sign}${absoluteValue.toLocaleString("en-US")}`;
}

export function HeroSnapshotCountUp({
  value,
  step,
  durationMs = 1200,
  delayMs = 0,
  variant,
  className,
}: HeroSnapshotCountUpProps) {
  const [currentValue, setCurrentValue] = useState(value);

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      return;
    }

    let timeoutId: number | null = null;
    let intervalId: number | null = null;
    const normalizedValue = Math.max(0, value);
    const normalizedStep = Math.max(1, step);
    const totalSteps = Math.max(1, Math.ceil(normalizedValue / normalizedStep));
    const intervalMs = Math.max(16, Math.round(durationMs / totalSteps));
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      setCurrentValue(0);

      timeoutId = window.setTimeout(() => {
        let stepIndex = 0;

        intervalId = window.setInterval(() => {
          stepIndex += 1;

          if (stepIndex >= totalSteps) {
            setCurrentValue(normalizedValue);

            if (intervalId !== null) {
              window.clearInterval(intervalId);
              intervalId = null;
            }

            return;
          }

          setCurrentValue(Math.min(stepIndex * normalizedStep, normalizedValue));
        }, intervalMs);

        if (cancelled) {
          window.clearTimeout(timeoutId);
          if (intervalId !== null) {
            window.clearInterval(intervalId);
            intervalId = null;
          }
        }
      }, delayMs);
    });

    return () => {
      cancelled = true;

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [delayMs, durationMs, step, value]);

  const displayValue = useMemo(() => {
    if (variant === "currency") {
      return formatCompactUsd(currentValue);
    }

    return `${abbreviateCount(currentValue)}+ Investors`;
  }, [currentValue, variant]);

  return <span className={cn("tabular-nums", className)}>{displayValue}</span>;
}
