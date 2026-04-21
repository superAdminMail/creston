export type SiteSettingsFieldName =
  | "siteName"
  | "siteDescription"
  | "siteTagline"
  | "siteAddress"
  | "siteCRN"
  | "siteFRN"
  | "seoTitle"
  | "seoDescription"
  | "supportEmail"
  | "supportPhone"
  | "supportPhoneSecondary"
  | "locale"
  | "keywords"
  | "defaultTwitterHandle"
  | "facebookUrl"
  | "instagramUrl"
  | "siteLogoFileAssetId"
  | "defaultOgImageFileAssetId";

export type SiteSettingsFormActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<SiteSettingsFieldName, string>>;
};

export const initialSiteSettingsFormActionState: SiteSettingsFormActionState = {
  status: "idle",
};
