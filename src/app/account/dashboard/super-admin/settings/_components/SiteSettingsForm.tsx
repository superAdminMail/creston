"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SuperAdminFormSelect } from "../../_components/SuperAdminFormSelect";

type SiteSettingsFormProps = {
  defaultValues: SiteSettingsFormValues;
  fileAssetOptions: SiteSettingsAssetOption[];
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="btn-primary rounded-xl px-5" disabled={pending}>
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
  const [state, formAction] = useActionState<SiteSettingsFormActionState, FormData>(
    upsertSiteConfiguration,
    initialSiteSettingsFormActionState,
  );
  const [siteName, setSiteName] = useState(defaultValues.siteName);
  const [siteTagline, setSiteTagline] = useState(defaultValues.siteTagline);
  const [siteDescription, setSiteDescription] = useState(
    defaultValues.siteDescription,
  );
  const [supportEmail, setSupportEmail] = useState(defaultValues.supportEmail);
  const [supportPhone, setSupportPhone] = useState(defaultValues.supportPhone);
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
  const [keywords, setKeywords] = useState<string[]>(defaultValues.keywords);
  const [keywordInput, setKeywordInput] = useState("");

  const serializedKeywords = useMemo(() => JSON.stringify(keywords), [keywords]);

  const siteLogoAsset = useMemo(
    () =>
      fileAssetOptions.find((asset) => asset.id === siteLogoFileAssetId) ?? null,
    [fileAssetOptions, siteLogoFileAssetId],
  );
  const defaultOgImageAsset = useMemo(
    () =>
      fileAssetOptions.find((asset) => asset.id === defaultOgImageFileAssetId) ??
      null,
    [defaultOgImageFileAssetId, fileAssetOptions],
  );

  useEffect(() => {
    if (state.status === "success" && state.message) {
      toast.success(state.message, { id: "site-settings-success" });
      router.refresh();
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message, { id: "site-settings-error" });
    }
  }, [router, state.message, state.status]);

  const addKeywords = (value: string) => {
    const nextKeywords = normalizeKeywordInput(value);

    if (nextKeywords.length === 0) {
      return;
    }

    setKeywords((current) =>
      Array.from(
        new Set(
          [...current, ...nextKeywords].map((keyword) => keyword.toLowerCase()),
        ),
      ),
    );
    setKeywordInput("");
  };

  const removeKeyword = (keyword: string) => {
    setKeywords((current) => current.filter((item) => item !== keyword));
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="keywords" value={serializedKeywords} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <div className="space-y-6">
          <Card className="border-white/8 bg-[#08101d]/96 text-white shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>
                Core copy used throughout the Havenstone public experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="gap-5">
                <Field>
                  <FieldLabel className="text-slate-100">Site name</FieldLabel>
                  <FieldContent>
                    <Input
                      name="siteName"
                      value={siteName}
                      onChange={(event) => setSiteName(event.target.value)}
                      className="input-premium h-11 rounded-xl"
                    />
                    <FieldDescription className="text-slate-400">
                      {state.fieldErrors?.siteName}
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel className="text-slate-100">Site tagline</FieldLabel>
                  <FieldContent>
                    <Input
                      name="siteTagline"
                      value={siteTagline}
                      onChange={(event) => setSiteTagline(event.target.value)}
                      className="input-premium h-11 rounded-xl"
                    />
                    <FieldDescription className="text-slate-400">
                      {state.fieldErrors?.siteTagline}
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel className="text-slate-100">
                    Site description
                  </FieldLabel>
                  <FieldContent>
                    <textarea
                      name="siteDescription"
                      value={siteDescription}
                      onChange={(event) => setSiteDescription(event.target.value)}
                      rows={5}
                      className="input-premium min-h-32 w-full rounded-xl px-3 py-3"
                    />
                    <FieldDescription className="text-slate-400">
                      {state.fieldErrors?.siteDescription}
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-[#08101d]/96 text-white shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Select FileAsset-backed brand images for the public site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <Field>
                  <FieldLabel className="text-slate-100">Site logo</FieldLabel>
                  <FieldContent>
                    <SuperAdminFormSelect
                      name="siteLogoFileAssetId"
                      value={siteLogoFileAssetId}
                      onValueChange={setSiteLogoFileAssetId}
                      placeholder="Select site logo"
                      emptyOptionLabel="No site logo"
                      options={fileAssetOptions.map((option) => ({
                        value: option.id,
                        label: option.label,
                      }))}
                    />
                    <FieldDescription className="text-slate-400">
                      {state.fieldErrors?.siteLogoFileAssetId}
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel className="text-slate-100">
                    Default OG image
                  </FieldLabel>
                  <FieldContent>
                    <SuperAdminFormSelect
                      name="defaultOgImageFileAssetId"
                      value={defaultOgImageFileAssetId}
                      onValueChange={setDefaultOgImageFileAssetId}
                      placeholder="Select default OG image"
                      emptyOptionLabel="No OG image"
                      options={fileAssetOptions.map((option) => ({
                        value: option.id,
                        label: option.label,
                      }))}
                    />
                    <FieldDescription className="text-slate-400">
                      {state.fieldErrors?.defaultOgImageFileAssetId}
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <FileAssetPreview title="Site logo" asset={siteLogoAsset} />
                <FileAssetPreview
                  title="Default OG image"
                  asset={defaultOgImageAsset}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-[#08101d]/96 text-white shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>
                Public support information used across the Havenstone site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 lg:grid-cols-2">
                <Field>
                  <FieldLabel className="text-slate-100">
                    Support email
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      name="supportEmail"
                      value={supportEmail}
                      onChange={(event) => setSupportEmail(event.target.value)}
                      className="input-premium h-11 rounded-xl"
                    />
                    <FieldDescription className="text-slate-400">
                      {state.fieldErrors?.supportEmail}
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel className="text-slate-100">
                    Support phone
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      name="supportPhone"
                      value={supportPhone}
                      onChange={(event) => setSupportPhone(event.target.value)}
                      className="input-premium h-11 rounded-xl"
                    />
                    <FieldDescription className="text-slate-400">
                      {state.fieldErrors?.supportPhone}
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-[#08101d]/96 text-white shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
            <CardHeader>
              <CardTitle>Social</CardTitle>
              <CardDescription>
                Official public handles and destination links.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="gap-5">
                <Field>
                  <FieldLabel className="text-slate-100">
                    Twitter handle
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      name="defaultTwitterHandle"
                      value={defaultTwitterHandle}
                      onChange={(event) =>
                        setDefaultTwitterHandle(event.target.value)
                      }
                      className="input-premium h-11 rounded-xl"
                      placeholder="@havenstone"
                    />
                    <FieldDescription className="text-slate-400">
                      {state.fieldErrors?.defaultTwitterHandle}
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <div className="grid gap-5 lg:grid-cols-2">
                  <Field>
                    <FieldLabel className="text-slate-100">Facebook URL</FieldLabel>
                    <FieldContent>
                      <Input
                        name="facebookUrl"
                        value={facebookUrl}
                        onChange={(event) => setFacebookUrl(event.target.value)}
                        className="input-premium h-11 rounded-xl"
                      />
                      <FieldDescription className="text-slate-400">
                        {state.fieldErrors?.facebookUrl}
                      </FieldDescription>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel className="text-slate-100">Instagram URL</FieldLabel>
                    <FieldContent>
                      <Input
                        name="instagramUrl"
                        value={instagramUrl}
                        onChange={(event) => setInstagramUrl(event.target.value)}
                        className="input-premium h-11 rounded-xl"
                      />
                      <FieldDescription className="text-slate-400">
                        {state.fieldErrors?.instagramUrl}
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/8 bg-[#08101d]/96 text-white shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
            <CardHeader>
              <CardTitle>Localization</CardTitle>
              <CardDescription>
                Locale and keyword defaults used in metadata and discovery.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="gap-5">
                <Field>
                  <FieldLabel className="text-slate-100">Locale</FieldLabel>
                  <FieldContent>
                    <Input
                      name="locale"
                      value={locale}
                      onChange={(event) => setLocale(event.target.value)}
                      className="input-premium h-11 rounded-xl"
                      placeholder="en_US"
                    />
                    <FieldDescription className="text-slate-400">
                      {state.fieldErrors?.locale}
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel className="text-slate-100">Keywords</FieldLabel>
                  <FieldContent>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex flex-wrap gap-2">
                        {keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-100"
                          >
                            <Tag className="h-3.5 w-3.5" />
                            {keyword}
                            <button
                              type="button"
                              onClick={() => removeKeyword(keyword)}
                              className="rounded-full text-blue-100/75 transition hover:text-white"
                              aria-label={`Remove ${keyword}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Input
                          value={keywordInput}
                          onChange={(event) => setKeywordInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === ",") {
                              event.preventDefault();
                              addKeywords(keywordInput);
                            }
                          }}
                          onBlur={() => addKeywords(keywordInput)}
                          className="input-premium h-11 rounded-xl"
                          placeholder="Add keyword and press Enter"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => addKeywords(keywordInput)}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    <FieldDescription className="text-slate-400">
                      {state.fieldErrors?.keywords ||
                        "Use Enter or commas to add keywords."}
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-[#08101d]/96 text-white shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
            <CardHeader>
              <CardTitle>Publishing note</CardTitle>
              <CardDescription>
                Changes here affect the singleton configuration used by the
                entire Havenstone public surface.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
                Save after branding or support updates so cached metadata and
                public pages can revalidate with the latest configuration.
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <Building2 className="h-4 w-4 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Singleton configuration
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Havenstone keeps one site configuration record. This form
                      will create it if missing and update it thereafter.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="rounded-xl" asChild>
              <a href="/account/dashboard/super-admin">Cancel</a>
            </Button>
            <SubmitButton />
          </div>
        </div>
      </div>
    </form>
  );
}
