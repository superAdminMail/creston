import { AdminAnalyticsClient } from "./_components/AdminAnalyticsClient";
import { getAdminAnalyticsData } from "@/lib/service/getAdminAnalyticsData";

export default async function AdminAnalyticsPage() {
  const data = await getAdminAnalyticsData();

  return <AdminAnalyticsClient data={data} />;
}
