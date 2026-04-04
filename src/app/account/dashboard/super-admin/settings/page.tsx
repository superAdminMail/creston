import Link from "next/link";
import { LockKeyhole, Building2 } from "lucide-react";

import { getSiteConfiguration } from "@/actions/super-admin/site-settings/getSiteConfiguration";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteSettingsForm } from "./_components/SiteSettingsForm";
import { SiteSettingsHeader } from "./_components/SiteSettingsHeader";
import SecuritySection from "../../../../../components/settings/SecuritySection";

export default async function SuperAdminSettingsPage() {
  const data = await getSiteConfiguration();

  return (
    <div className="space-y-5 sm:space-y-6">
      <SiteSettingsHeader />

      <Tabs defaultValue="platform" className="space-y-5 sm:space-y-6">
        <TabsList className="h-auto w-full flex-col items-stretch gap-1 rounded-xl border border-white/8 bg-white/[0.03] p-1 text-slate-400 sm:inline-flex sm:w-auto sm:flex-row sm:items-center">
          <TabsTrigger
            value="platform"
            className="h-10 w-full min-w-0 justify-start rounded-lg border border-transparent px-3 text-sm font-medium text-slate-400 transition-all duration-200 hover:text-white data-active:border-white/10 data-active:bg-[#0d1a2c] data-active:text-white sm:w-[168px]"
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="h-4.5 w-4.5 text-blue-300" />
              <span>Platform Settings</span>
            </div>
          </TabsTrigger>

          <TabsTrigger
            value="security"
            className="h-10 w-full min-w-0 justify-start rounded-lg border border-transparent px-3 text-sm font-medium text-slate-400 transition-all duration-200 hover:text-white data-active:border-white/10 data-active:bg-[#0d1a2c] data-active:text-white sm:w-[168px]"
          >
            <div className="flex items-center gap-2.5">
              <LockKeyhole className="h-4.5 w-4.5 text-emerald-300" />
              <span>Security Settings</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="mt-0 outline-none">
          <SiteSettingsForm
            defaultValues={data.values}
            fileAssetOptions={data.fileAssetOptions}
          />
        </TabsContent>

        <TabsContent value="security" className="mt-0 outline-none">
          <SecuritySection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
