"use client";

import { useEffect } from "react";

const APP_LOADING_COOKIE_NAME = "app_loading_seen";

function hasCookie(name: string) {
  return document.cookie
    .split("; ")
    .some((entry) => entry.startsWith(`${name}=`));
}

export function AppLoadSeenMarker() {
  useEffect(() => {
    if (hasCookie(APP_LOADING_COOKIE_NAME)) return;

    document.cookie = `${APP_LOADING_COOKIE_NAME}=1; path=/; SameSite=Lax`;
  }, []);

  return null;
}
