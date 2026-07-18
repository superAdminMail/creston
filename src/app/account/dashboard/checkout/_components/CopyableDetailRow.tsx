"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopyableDetailRowProps = {
  label: string;
  value?: string | null;
  className?: string;
  copyLabel?: string;
};

export function CopyableDetailRow({
  label,
  value,
  className,
  copyLabel,
}: CopyableDetailRowProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyValue = typeof value === "string" ? value.trim() : "";

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!copyValue) {
    return null;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      toast.success(`${copyLabel ?? label} copied`);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Unable to copy.");
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 break-words text-sm font-semibold text-slate-950 dark:text-white">
            {copyValue}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => void handleCopy()}
          className="h-8 w-8 shrink-0 rounded-full border border-border/60 bg-white/80 text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">Copy {label}</span>
        </Button>
      </div>
    </div>
  );
}
