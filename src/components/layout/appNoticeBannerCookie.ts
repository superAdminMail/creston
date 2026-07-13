export const APP_NOTICE_BANNER_COOKIE =
  "havenstone_app_test_system_notice_dismissed";

export function getAppNoticeBannerCookieName(dismissalKey?: string) {
  const normalizedKey = dismissalKey?.trim();

  return normalizedKey
    ? `${APP_NOTICE_BANNER_COOKIE}:${normalizedKey}`
    : APP_NOTICE_BANNER_COOKIE;
}
