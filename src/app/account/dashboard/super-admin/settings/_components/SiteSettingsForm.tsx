"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useFormStatus } from "react-dom";
import { Building2, Tag, X } from "lucide-react";
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SuperAdminFormSelect } from "../../_components/SuperAdminFormSelect";

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

function normalizeKeywordInput(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function SiteSettingsForm({
  defaultValues,
  fileAssetOptions,
}: SiteSettingsFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState<
    SiteSettingsFormActionState,
    FormData
  >(upsertSiteConfiguration, initialSiteSettingsFormActionState);
  const [isPending, startTransition] = useTransition();

  const [siteName, setSiteName] = useState(defaultValues.siteName);
  const [siteTagline, setSiteTagline] = useState(defaultValues.siteTagline);
  const [siteDescription, setSiteDescription] = useState(
    defaultValues.siteDescription,
  );
  const [supportEmail, setSupportEmail] = useState(defaultValues.supportEmail);

  const [phoneFields, setPhoneFields] = useState<
    Record<PhoneFieldKey, { countryCode: string; localNumber: string }>
  >({
    supportPhone: splitNormalizedPhone(defaultValues.supportPhone),
  });

  const [locale, setLocale] = useState(defaultValues.locale);
  const [defaultTwitterHandle, setDefaultTwitterHandle] = useState(
    defaultValues.defaultTwitterHandle,
  );
  const [facebookUrl, setFacebookUrl] = useState(defaultValues.facebookUrl);
  const [instagramUrl, setInstagramUrl] = useState(defaultValues.instagramUrl);

  const [siteLogoFileAssetId, setSiteLogoFileAssetId] = useState(
    defaultValues.siteLogoFileAssetId,
  );

  const [defaultOgImageFileAssetId, setDefaultOgImageFileAssetId] = useState(
    defaultValues.defaultOgImageFileAssetId,
  );

  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadPreviewKey, setUploadPreviewKey] = useState<string | null>(null);

  const [keywords, setKeywords] = useState<string[]>(defaultValues.keywords);
  const [keywordInput, setKeywordInput] = useState("");

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

  const defaultOgImageAsset = useMemo(
    () =>
      fileAssetOptions.find(
        (asset) => asset.id === defaultOgImageFileAssetId,
      ) ?? null,
    [defaultOgImageFileAssetId, fileAssetOptions],
  );

  useEffect(() => {
    if (state.status === "success" && state.message) {
      toast.success(state.message);
      router.refresh();
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [router, state]);

  const addKeywords = (value: string) => {
    const next = normalizeKeywordInput(value);
    if (!next.length) return;

    setKeywords((prev) =>
      Array.from(new Set([...prev, ...next.map((k) => k.toLowerCase())])),
    );
    setKeywordInput("");
  };

  const removeKeyword = (keyword: string) => {
    setKeywords((prev) => prev.filter((k) => k !== keyword));
  };

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
      <input
        type="hidden"
        name="siteLogoFileAssetId"
        value={siteLogoFileAssetId}
      />
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
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    name="siteDescription"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
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
                  setUploadPreviewUrl(file.url);
                  setUploadPreviewKey(file.key);

                  toast.success("Logo uploaded");
                }}
                className="
    ut-button:bg-white/[0.08]
    ut-button:text-blue-600
    ut-button:border
    ut-button:border-blue-500/30
    ut-button:rounded-full
    ut-button:px-5
    ut-button:py-2
    ut-button:text-sm
    hover:ut-button:bg-blue-500/20
  "
              />

              {uploadPreviewUrl && (
                <div className="flex gap-4 items-center">
                  <Image
                    src={uploadPreviewUrl}
                    alt="preview"
                    width={64}
                    height={64}
                  />

                  <Button
                    type="button"
                    onClick={async () => {
                      if (!uploadPreviewKey) return;

                      await deleteFileAction(uploadPreviewKey);

                      setUploadPreviewUrl(null);
                      setUploadPreviewKey(null);
                      setSiteLogoFileAssetId("");
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}

              {/* Existing select */}
              <SuperAdminFormSelect
                name="siteLogoFileAssetId"
                value={siteLogoFileAssetId}
                placeholder="Select a logo"
                onValueChange={setSiteLogoFileAssetId}
                options={fileAssetOptions.map((o) => ({
                  value: o.id,
                  label: o.label,
                }))}
              />

              <FileAssetPreview title="Site logo" asset={siteLogoAsset} />
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
              <Input
                name="supportEmail"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />

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
