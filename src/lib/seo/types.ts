export type SiteSeoConfig = {
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  siteTagline: string;
  siteAddress: string;
  siteCRN: string;
  siteFRN: string;
  defaultOgImageUrl: string;
  defaultTwitterHandle?: string;
  locale: string;
  keywords: string[];
  companyName: string;
};

export type ResolvedSeoFields = {
  title: string;
  description: string;
  imageUrl: string;
  keywords: string[];
};
