import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import HomeSkeleton from "@/components/skeletons/HomeSkeleton";
import { NavbarSkeleton } from "@/components/skeletons/NavbarSkeleton";

export default async function Loading() {
  await getSiteConfigurationCached();

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-site-shell">
      <NavbarSkeleton />
      <HomeSkeleton />
    </div>
  );
}
