"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";
import { Maximize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  caption?: string | null;
  className?: string;
  children?: ReactNode;
};

export default function ConversationImagePreview({
  src,
  alt,
  caption,
  className,
  children,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group relative block w-full overflow-hidden rounded-2xl border border-black/10 bg-black/5 text-left",
          className,
        )}
        aria-label="Preview image"
      >
        {children ?? (
          <>
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={900}
              unoptimized
              className="max-h-80 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/5" />
            <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white/85 opacity-0 shadow-sm backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100">
              <Maximize2 className="h-3 w-3" />
              Preview
            </div>
          </>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="border-white/10 bg-[linear-gradient(180deg,rgba(10,19,41,0.98),rgba(7,12,24,0.98))] text-white shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:max-w-4xl"
          showCloseButton={false}
        >
          <DialogHeader className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <DialogTitle className="text-lg font-semibold text-white">
                  Image preview
                </DialogTitle>
                <DialogDescription className="text-sm leading-6 text-slate-400">
                  {caption?.trim()
                    ? caption.trim()
                    : "Tap outside the image or use the close button to dismiss."}
                </DialogDescription>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] hover:text-white"
                aria-label="Close image preview"
              >
                <span className="text-lg leading-none">&times;</span>
              </Button>
            </div>
          </DialogHeader>

          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20">
            <Image
              src={src}
              alt={alt}
              width={1600}
              height={1200}
              unoptimized
              className="max-h-[72vh] w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
