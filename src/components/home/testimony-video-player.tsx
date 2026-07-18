"use client";

import * as React from "react";

type TestimonyVideoPlayerProps = {
  src: string;
  title: string;
  className?: string;
};

export function TestimonyVideoPlayer({
  src,
  title,
  className,
}: TestimonyVideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const userPausedRef = React.useRef(false);
  const suppressPauseRef = React.useRef(false);

  React.useEffect(() => {
    const video = videoRef.current;

    if (!video || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (entry.intersectionRatio >= 0.65) {
          if (!video.paused && !video.ended) {
            return;
          }

          if (!userPausedRef.current) {
            void video.play().catch(() => {});
          }
          return;
        }

        if (!video.paused) {
          suppressPauseRef.current = true;
          video.pause();
        }
      },
      {
        threshold: [0, 0.35, 0.65, 1],
      },
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      title={title}
      controls
      muted
      playsInline
      preload="metadata"
      className={className}
      onPlay={() => {
        userPausedRef.current = false;
      }}
      onPause={() => {
        if (suppressPauseRef.current) {
          suppressPauseRef.current = false;
          return;
        }

        userPausedRef.current = true;
      }}
    />
  );
}
