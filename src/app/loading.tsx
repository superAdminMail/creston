import { cookies } from "next/headers";

import { AppSplashScreen } from "@/components/layout/AppSplashScreen";

const APP_LOADING_COOKIE_NAME = "app_loading_seen";

export default async function Loading() {
  const cookieStore = await cookies();
  if (cookieStore.get(APP_LOADING_COOKIE_NAME)?.value === "1") {
    return null;
  }

  return <AppSplashScreen />;
}
