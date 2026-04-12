"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import type {
  SiteSettingsAssetOption,
  SiteSettingsFormValues,
} from "@/actions/super-admin/site-settings/getSiteConfiguration";
import { upsertSiteConfiguration } from "@/actions/super-admin/site-settings/upsertSiteConfiguration";
import type { SiteSettingsFormActionState } from "@/actions/super-admin/site-settings/siteSettingsForm.state";
import { initialSiteSettingsFormActionState } from "@/actions/super-admin/site-settings/siteSettingsForm.state";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import {
  normalizePhoneToE164,
  splitNormalizedPhone,
} from "@/lib/format-phone/phone";

import { UploadButton } from "@/utils/uploadthing";
import { createFileAssetFromUpload } from "@/actions/files/createFileAssetFromUpload";
import { deleteFileAction } from "@/actions/files/file";

type SiteSettingsFormProps = {
  defaultValues: SiteSettingsFormValues;
  fileAssetOptions: SiteSettingsAssetOption[];
  previews: {
    siteLogo: SiteSettingsAssetOption | null;
    defaultOgImage: SiteSettingsAssetOption | null;
  };
};

type PhoneFieldKey = "supportPhone";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="btn-primary rounded-xl px-5"
      disabled={pending}
    >
      {pending ? "Saving..." : "Save site settings"}
    </Button>
  );
}

function FileAssetPreview({
  title,
  asset,
}: {
  title: string;
  asset: SiteSettingsAssetOption | null;
}) {
  if (!asset) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-slate-400">
        No {title.toLowerCase()} selected.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <Image
            src={asset.url}
            alt={asset.label}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="mt-1 text-sm text-slate-400">{asset.label}</p>
        </div>
      </div>
    </div>
  );
}

export function SiteSettingsForm({
  defaultValues,
  fileAssetOptions,
  previews,
}: SiteSettingsFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState<
    SiteSettingsFormActionState,
    FormData
  >(upsertSiteConfiguration, initialSiteSettingsFormActionState);

  const [siteName, setSiteName] = useState(defaultValues.siteName);
  const [siteTagline, setSiteTagline] = useState(defaultValues.siteTagline);
  const [siteDescription, setSiteDescription] = useState(
    defaultValues.siteDescription,
  );
  const [siteAddress, setSiteAddress] = useState(defaultValues.siteAddress);
  const [siteLLC, setSiteLLC] = useState(defaultValues.siteLLC);
  const [supportEmail, setSupportEmail] = useState(defaultValues.supportEmail);
  const [locale, setLocale] = useState(defaultValues.locale);
  const [seoTitle, setSeoTitle] = useState(defaultValues.seoTitle);
  const [seoDescription, setSeoDescription] = useState(
    defaultValues.seoDescription,
  );
  const [defaultTwitterHandle, setDefaultTwitterHandle] = useState(
    defaultValues.defaultTwitterHandle,
  );
  const [facebookUrl, setFacebookUrl] = useState(defaultValues.facebookUrl);
  const [instagramUrl, setInstagramUrl] = useState(defaultValues.instagramUrl);

  const [phoneFields, setPhoneFields] = useState<
    Record<PhoneFieldKey, { countryCode: string; localNumber: string }>
  >({
    supportPhone: splitNormalizedPhone(defaultValues.supportPhone),
  });

  const [siteLogoFileAssetId, setSiteLogoFileAssetId] = useState(
    defaultValues.siteLogoFileAssetId,
  );
  const [defaultOgImageFileAssetId, setDefaultOgImageFileAssetId] = useState(
    defaultValues.defaultOgImageFileAssetId,
  );
  const [uploadedSiteLogoPreview, setUploadedSiteLogoPreview] = useState<{
    id: string;
    label: string;
    url: string;
    storageKey: string;
  } | null>(null);
  const [uploadedOgImagePreview, setUploadedOgImagePreview] = useState<{
    id: string;
    label: string;
    url: string;
    storageKey: string;
  } | null>(null);

  const [keywords, setKeywords] = useState<string[]>(defaultValues.keywords);

  const serializedKeywords = useMemo(
    () => JSON.stringify(keywords),
    [keywords],
  );

  const siteLogoAsset = useMemo(
    () =>
      fileAssetOptions.find((asset) => asset.id === siteLogoFileAssetId) ??
      null,
    [fileAssetOptions, siteLogoFileAssetId],
  );

  const siteLogoPreview =
    uploadedSiteLogoPreview?.id === siteLogoFileAssetId
      ? uploadedSiteLogoPreview
      : siteLogoAsset;

  const defaultOgImageAsset = useMemo(
    () =>
      fileAssetOptions.find(
        (asset) => asset.id === defaultOgImageFileAssetId,
      ) ?? null,
    [fileAssetOptions, defaultOgImageFileAssetId],
  );

  const defaultOgImagePreview =
    uploadedOgImagePreview?.id === defaultOgImageFileAssetId
      ? uploadedOgImagePreview
      : defaultOgImageAsset ?? previews.defaultOgImage;

  useEffect(() => {
    if (state.status === "success" && state.message) {
      toast.success(state.message);
      router.refresh();
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [router, state]);

  const syncPhoneValue = (
    field: PhoneFieldKey,
    nextValue: { countryCode: string; localNumber: string },
  ) => {
    setPhoneFields((current) => ({
      ...current,
      [field]: nextValue,
    }));
  };

  const renderPhoneField = ({
    field,
    label,
    error,
  }: {
    field: PhoneFieldKey;
    label: string;
    error?: string;
  }) => (
    <div className="space-y-2">
      <p className="text-sm text-white">{label}</p>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="flex items-center border px-3 rounded-md">
          <span>+</span>
          <Input
            value={phoneFields[field].countryCode}
            onChange={(e) =>
              syncPhoneValue(field, {
                countryCode: e.target.value.replace(/\D/g, ""),
                localNumber: phoneFields[field].localNumber,
              })
            }
          />
        </div>

        <Input
          className="sm:col-span-2"
          value={phoneFields[field].localNumber}
          onChange={(e) =>
            syncPhoneValue(field, {
              countryCode: phoneFields[field].countryCode,
              localNumber: e.target.value.replace(/\D/g, ""),
            })
          }
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* HIDDEN */}
      <input type="hidden" name="keywords" value={serializedKeywords} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="siteAddress" value={siteAddress} />
      <input type="hidden" name="siteLLC" value={siteLLC} />
      <input type="hidden" name="seoTitle" value={seoTitle} />
      <input type="hidden" name="seoDescription" value={seoDescription} />
      <input
        type="hidden"
        name="defaultTwitterHandle"
        value={defaultTwitterHandle}
      />
      <input type="hidden" name="facebookUrl" value={facebookUrl} />
      <input type="hidden" name="instagramUrl" value={instagramUrl} />
      <input
        type="hidden"
        name="supportPhone"
        value={(() => {
          try {
            return normalizePhoneToE164(phoneFields.supportPhone);
          } catch {
            return "";
          }
        })()}
      />

      {/* CONTENT */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          {/* GENERAL */}
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Site name</FieldLabel>
                  <Input
                    name="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel>Tagline</FieldLabel>
                  <Input
                    name="siteTagline"
                    value={siteTagline}
                    onChange={(e) => setSiteTagline(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel>Locale</FieldLabel>
                  <Input
                    name="locale"
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    placeholder="en_US"
                  />
                </Field>

                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    name="siteDescription"
                    rows={4}
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-400 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  />
                </Field>

                <Field>
                  <FieldLabel>Site address</FieldLabel>
                  <Input
                    name="siteAddress"
                    value={siteAddress}
                    onChange={(e) => setSiteAddress(e.target.value)}
                    placeholder="123 Main St, Anytown, USA"
                  />
                </Field>

                <Field>
                  <FieldLabel>LLC name</FieldLabel>
                  <Input
                    name="siteLLC"
                    value={siteLLC}
                    onChange={(e) => setSiteLLC(e.target.value)}
                    placeholder="Havenstone LLC"
                  />
                </Field>

                <Field>
                  <FieldLabel>Keywords</FieldLabel>
                  <FieldContent>
                    <textarea
                      value={keywords.join(", ")}
                      onChange={(e) =>
                        setKeywords(
                          e.target.value
                            .split(",")
                            .map((keyword) => keyword.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder="investment, savings, wealth"
                      rows={3}
                      className="w-full rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-400 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>SEO title</FieldLabel>
                  <Input
                    name="seoTitle"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Havenstone | Smarter investing"
                  />
                </Field>

                <Field>
                  <FieldLabel>SEO description</FieldLabel>
                  <textarea
                    name="seoDescription"
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Short search engine description for the homepage."
                    className="w-full rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-400 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* BRANDING */}
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Upload */}
              <UploadButton
                endpoint="siteLogo"
                onClientUploadComplete={async (res) => {
                  try {
                    const file = res?.[0];
                    if (!file) return;

                    const asset = await createFileAssetFromUpload({
                      url: file.url,
                      key: file.key,
                      name: file.name,
                      size: file.size,
                      type: file.type,
                    });

                    setSiteLogoFileAssetId(asset.id);
                    setUploadedSiteLogoPreview({
                      id: asset.id,
                      label: file.name,
                      url: file.url,
                      storageKey: file.key,
                    });

                    toast.success("Logo uploaded");
                  } catch {
                    toast.error("Unable to attach the uploaded logo.");
                  }
                }}
                onUploadError={() => {
                  toast.error("Logo upload failed.");
                }}
                className="
    ut-button:bg-blue-600
    ut-button:text-white
    ut-button:border
    ut-button:border-blue-500/20
    ut-button:rounded-full
    ut-button:px-5
    ut-button:py-2
    ut-button:text-sm
    hover:ut-button:bg-blue-500
  "
              />

              {uploadedSiteLogoPreview?.id === siteLogoFileAssetId && (
                <div className="flex gap-4 items-center">
                  <Image
                    src={uploadedSiteLogoPreview.url}
                    alt="preview"
                    width={64}
                    height={64}
                  />

                  <Button
                    type="button"
                    onClick={async () => {
                      if (!uploadedSiteLogoPreview?.storageKey) return;

                      await deleteFileAction(
                        uploadedSiteLogoPreview.storageKey,
                      );

                      setUploadedSiteLogoPreview(null);
                      setSiteLogoFileAssetId("");
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}

              <input
                type="hidden"
                name="siteLogoFileAssetId"
                value={siteLogoFileAssetId}
              />

              {state.fieldErrors?.siteLogoFileAssetId ? (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.siteLogoFileAssetId}
                </p>
              ) : null}

              <FileAssetPreview title="Site logo" asset={siteLogoPreview} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open Graph Image</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <UploadButton
                endpoint="siteLogo"
                onClientUploadComplete={async (res) => {
                  try {
                    const file = res?.[0];
                    if (!file) return;

                    const asset = await createFileAssetFromUpload({
                      url: file.url,
                      key: file.key,
                      name: file.name,
                      size: file.size,
                      type: file.type,
                    });

                    setDefaultOgImageFileAssetId(asset.id);
                    setUploadedOgImagePreview({
                      id: asset.id,
                      label: file.name,
                      url: file.url,
                      storageKey: file.key,
                    });

                    toast.success("OG image uploaded");
                  } catch {
                    toast.error("Unable to attach the uploaded OG image.");
                  }
                }}
                onUploadError={() => {
                  toast.error("OG image upload failed.");
                }}
                className="
    ut-button:bg-blue-600
    ut-button:text-white
    ut-button:border
    ut-button:border-blue-500/20
    ut-button:rounded-full
    ut-button:px-5
    ut-button:py-2
    ut-button:text-sm
    hover:ut-button:bg-blue-500
  "
              />

              <input
                type="hidden"
                name="defaultOgImageFileAssetId"
                value={defaultOgImageFileAssetId}
              />

              {uploadedOgImagePreview?.id === defaultOgImageFileAssetId && (
                <div className="flex items-center gap-4">
                  <Image
                    src={uploadedOgImagePreview.url}
                    alt="preview"
                    width={64}
                    height={64}
                  />

                  <Button
                    type="button"
                    className="btn-ghost-premium"
                    onClick={async () => {
                      if (!uploadedOgImagePreview?.storageKey) return;

                      await deleteFileAction(uploadedOgImagePreview.storageKey);

                      setUploadedOgImagePreview(null);
                      setDefaultOgImageFileAssetId("");
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}

              <FileAssetPreview
                title="Default OG image"
                asset={defaultOgImagePreview}
              />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>

            <CardContent>
              Support email
              <Input
                name="supportEmail"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />
              <Field className="mt-4">
                <FieldLabel>Twitter handle</FieldLabel>
                <Input
                  name="defaultTwitterHandle"
                  value={defaultTwitterHandle}
                  onChange={(e) => setDefaultTwitterHandle(e.target.value)}
                  placeholder="@havenstone"
                />
              </Field>
              <Field className="mt-4">
                <FieldLabel>Facebook URL</FieldLabel>
                <Input
                  name="facebookUrl"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </Field>
              <Field className="mt-4">
                <FieldLabel>Instagram URL</FieldLabel>
                <Input
                  name="instagramUrl"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </Field>
              {renderPhoneField({
                field: "supportPhone",
                label: "Phone",
                error: state.fieldErrors?.supportPhone,
              })}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </div>
      </div>
    </form>
  );
}
