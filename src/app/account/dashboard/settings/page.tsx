import SecuritySection from "@/components/settings/SecuritySection";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

const page = async () => {
  const site = await getSiteConfigurationCached();

  return (
    <div>
      <SecuritySection siteName={site?.siteName?.trim() || "Company"} />
    </div>
  );
};

export default page;
