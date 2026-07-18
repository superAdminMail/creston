"use client";

import { useEffect } from "react";

const ANDROID_RENDER_MODE_ATTR = "data-render-mode";
const ANDROID_SAFE_RENDER_MODE = "android-safe";

function shouldUseAndroidSafeRenderMode() {
  if (typeof window === "undefined") return false;

  const navigatorWithUAData = navigator as Navigator & {
    userAgentData?: {
      platform?: string;
    };
  };

  const userAgent = navigator.userAgent;
  const platform = navigatorWithUAData.userAgentData?.platform ?? "";
  const isAndroid = /Android/i.test(userAgent) || platform === "Android";
  const isMobileAndroid = isAndroid && /Mobile/i.test(userAgent);

  return isMobileAndroid && window.innerWidth < 1024;
}

export function AndroidRenderModeMarker() {
  useEffect(() => {
    const root = document.documentElement;

    const applyRenderMode = () => {
      const shouldUseAndroidSafeMode = shouldUseAndroidSafeRenderMode();

      if (shouldUseAndroidSafeMode) {
        root.setAttribute(ANDROID_RENDER_MODE_ATTR, ANDROID_SAFE_RENDER_MODE);
        return;
      }

      if (root.getAttribute(ANDROID_RENDER_MODE_ATTR) === ANDROID_SAFE_RENDER_MODE) {
        root.removeAttribute(ANDROID_RENDER_MODE_ATTR);
      }
    };

    applyRenderMode();
    window.addEventListener("resize", applyRenderMode);

    return () => {
      window.removeEventListener("resize", applyRenderMode);

      if (root.getAttribute(ANDROID_RENDER_MODE_ATTR) === ANDROID_SAFE_RENDER_MODE) {
        root.removeAttribute(ANDROID_RENDER_MODE_ATTR);
      }
    };
  }, []);

  return null;
}
