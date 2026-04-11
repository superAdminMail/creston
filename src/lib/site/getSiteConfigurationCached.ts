import { cache } from "react";
import { getSiteConfiguration } from "@/lib/site/getSiteConfiguration";

export const getSiteConfigurationCached = cache(async () => {
  return getSiteConfiguration();
});
