"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { createFileAssetFromUpload } from "@/actions/files/createFileAssetFromUpload";
import { deleteFileAssetAction } from "@/actions/files/file";
import type { TestimonyFormActionState } from "@/actions/admin/testimonies/testimonyForm.state";
import { initialTestimonyFormState } from "@/actions/admin/testimonies/testimonyForm.state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UploadButton } from "@/utils/uploadthing";
import { DashboardActionSubmitButton } from "../../../_components/DashboardActionSubmitButton";

type TestimonyFormMode = "create" | "edit";

type TestimonyFormProps = {
  mode?: TestimonyFormMode;
  testimonyId?: string;
  defaultValues?: {
    fullName?: string;
    roleOrTitle?: string;
    message?: string;
    rating?: string;
    status?: string;
    avatarFileId?: string;
    videoFileId?: string;
    sortOrder?: string;
    isFeatured?: boolean;
  };
  initialAvatarUrl?: string | null;
  initialVideoUrl?: string | null;
  formAction: (
    state: TestimonyFormActionState,
    formData: FormData,
  ) => Promise<TestimonyFormActionState>;
};

export function TestimonyForm({
  mode = "create",
  testimonyId,
  defaultValues,
  initialAvatarUrl = null,
  initialVideoUrl = null,
  formAction,
}: TestimonyFormProps) {
  const [state, action] = useActionState(formAction, initialTestimonyFormState);
  const [avatarFileId, setAvatarFileId] = useState(defaultValues?.avatarFileId ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialAvatarUrl);
  const [videoFileId, setVideoFileId] = useState(defaultValues?.videoFileId ?? "");
  const [videoPreview, setVideoPreview] = useState<string | null>(initialVideoUrl);
  const [isFeatured, setIsFeatured] = useState(defaultValues?.isFeatured ?? false);
  const [status, setStatus] = useState(defaultValues?.status ?? "DRAFT");
  const fieldInputClassName =
    "!border-slate-200 !bg-white/95 !text-slate-900 !shadow-sm placeholder:!text-slate-500 focus:!border-sky-400 focus:!ring-sky-400/15 dark:!border-white/10 dark:!bg-slate-950/80 dark:!text-white dark:placeholder:!text-slate-400";
  const fieldSelectClassName =
    "h-11 w-full rounded-xl border border-slate-200 bg-white/95 px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-3 focus:ring-sky-400/15 dark:border-white/10 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-400";

  useEffect(() => {
    if (state.status === "success" && state.message) {
      toast.success(state.message);
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Card className="rounded-[2rem] border border-slate-200/80 bg-white/90 text-slate-950 shadow-sm dark:border-white/10 dark:bg-[#08101d]/96 dark:text-slate-100 dark:shadow-[0_24px_70px_rgba(2,6,23,0.32)]">
      <CardHeader>
        <CardTitle className="text-slate-950 dark:text-white">
          {mode === "edit" ? "Edit testimony" : "Create testimony"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          {testimonyId ? <input type="hidden" name="testimonyId" value={testimonyId} /> : null}
          <input type="hidden" name="avatarFileId" value={avatarFileId} />
          <input type="hidden" name="videoFileId" value={videoFileId} />
          <input type="hidden" name="isFeatured" value={String(isFeatured)} />
          <input type="hidden" name="status" value={status} />

          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel className="text-slate-700 dark:text-slate-100">Full name</FieldLabel>
              <FieldContent>
                <Input
                  name="fullName"
                  defaultValue={defaultValues?.fullName}
                  className={fieldInputClassName}
                />
                <FieldError>{state.fieldErrors?.fullName?.[0]}</FieldError>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-slate-700 dark:text-slate-100">Role or title</FieldLabel>
              <FieldContent>
                <Input
                  name="roleOrTitle"
                  defaultValue={defaultValues?.roleOrTitle}
                  className={fieldInputClassName}
                />
                <FieldError>{state.fieldErrors?.roleOrTitle?.[0]}</FieldError>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-slate-700 dark:text-slate-100">Message</FieldLabel>
              <FieldContent>
                <textarea
                  name="message"
                  defaultValue={defaultValues?.message}
                  rows={5}
                  className={`min-h-32 w-full rounded-xl border px-3 py-3 ${fieldInputClassName}`}
                />
                <FieldError>{state.fieldErrors?.message?.[0]}</FieldError>
              </FieldContent>
            </Field>

            <div className="grid gap-5 lg:grid-cols-2">
              <Field>
                <FieldLabel className="text-slate-700 dark:text-slate-100">Rating</FieldLabel>
                <FieldContent>
                <Input
                  name="rating"
                  defaultValue={defaultValues?.rating}
                  placeholder="5"
                  className={fieldInputClassName}
                />
                <FieldError>{state.fieldErrors?.rating?.[0]}</FieldError>
              </FieldContent>
            </Field>
              <Field>
                <FieldLabel className="text-slate-700 dark:text-slate-100">Sort order</FieldLabel>
                <FieldContent>
                <Input
                  name="sortOrder"
                  defaultValue={defaultValues?.sortOrder}
                  placeholder="0"
                  className={fieldInputClassName}
                />
                <FieldError>{state.fieldErrors?.sortOrder?.[0]}</FieldError>
              </FieldContent>
            </Field>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Field>
                <FieldLabel className="text-slate-700 dark:text-slate-100">Featured</FieldLabel>
                <FieldContent>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/75 px-4 py-3 text-slate-900 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Show as featured</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Promote this testimony on the public site.</p>
                    </div>
                    <Switch checked={isFeatured} onCheckedChange={(checked) => setIsFeatured(checked === true)} />
                  </div>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel className="text-slate-700 dark:text-slate-100">Status</FieldLabel>
                <FieldContent>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className={fieldSelectClassName}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <FieldError>{state.fieldErrors?.status?.[0]}</FieldError>
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldLabel className="text-slate-700 dark:text-slate-100">Avatar</FieldLabel>
              <FieldContent>
                <UploadButton
                  endpoint="photoManager"
                  className="ut-button:inline-flex ut-button:h-11 ut-button:items-center ut-button:justify-center ut-button:rounded-full ut-button:border ut-button:border-slate-200 ut-button:bg-white ut-button:px-5 ut-button:text-sm ut-button:font-semibold ut-button:text-slate-900 ut-button:shadow-sm ut-button:transition ut-button:hover:-translate-y-0.5 ut-button:hover:bg-slate-50 ut-button:hover:text-slate-950 ut-button:disabled:translate-y-0 ut-button:disabled:opacity-60 dark:ut-button:border-white/10 dark:ut-button:bg-slate-950 dark:ut-button:text-white dark:ut-button:hover:bg-slate-900"
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

                      if (avatarFileId && avatarFileId !== asset.id) {
                        const previousAssetDeletion = await deleteFileAssetAction(
                          avatarFileId,
                        );

                        if (previousAssetDeletion.error) {
                          toast.error(previousAssetDeletion.error);
                          return;
                        }
                      }

                      setAvatarFileId(asset.id);
                      setAvatarPreview(file.url);
                    } catch {
                      toast.error("Unable to attach the uploaded avatar.");
                    }
                  }}
                />

                {avatarPreview ? (
                  <div className="mt-4 flex items-center gap-4">
                    <Image src={avatarPreview} alt="avatar preview" width={56} height={56} className="rounded-xl object-cover" />
                    <Button
                      type="button"
                      className="btn-ghost-premium"
                      onClick={async () => {
                        if (avatarFileId) {
                          const deletion = await deleteFileAssetAction(avatarFileId);

                          if (deletion.error) {
                            toast.error(deletion.error);
                            return;
                          }
                        }

                        setAvatarPreview(null);
                        setAvatarFileId("");
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : null}

                <FieldError>{state.fieldErrors?.avatarFileId?.[0]}</FieldError>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-slate-700 dark:text-slate-100">Video</FieldLabel>
              <FieldContent>
                <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/75 p-4 text-slate-900 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-100">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Optional testimonial video
                      </p>
                      <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                        Upload one video only. You can replace or remove it at any time.
                      </p>
                    </div>

                    <UploadButton
                      endpoint="testimonialVideo"
                      className="ut-button:inline-flex ut-button:h-11 ut-button:items-center ut-button:justify-center ut-button:rounded-full ut-button:border ut-button:border-slate-200 ut-button:bg-white ut-button:px-5 ut-button:text-sm ut-button:font-semibold ut-button:text-slate-900 ut-button:shadow-sm ut-button:transition ut-button:hover:-translate-y-0.5 ut-button:hover:bg-slate-50 ut-button:hover:text-slate-950 ut-button:disabled:translate-y-0 ut-button:disabled:opacity-60 dark:ut-button:border-white/10 dark:ut-button:bg-slate-950 dark:ut-button:text-white dark:ut-button:hover:bg-slate-900"
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

                          if (videoFileId) {
                            const previousVideoDeletion = await deleteFileAssetAction(
                              videoFileId,
                            );

                            if (previousVideoDeletion.error) {
                              await deleteFileAssetAction(asset.id);
                              toast.error(previousVideoDeletion.error);
                              return;
                            }
                          }

                          setVideoFileId(asset.id);
                          setVideoPreview(file.url);
                        } catch {
                          toast.error("Unable to attach the uploaded video.");
                        }
                      }}
                      onUploadError={() => {
                        toast.error("Video upload failed.");
                      }}
                    />
                  </div>

                  {videoPreview ? (
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950/90 dark:border-white/10 dark:bg-black/30">
                      <video
                        src={videoPreview}
                        controls
                        muted
                        playsInline
                        preload="metadata"
                        className="aspect-video w-full"
                      />
                    </div>
                  ) : null}

                  {videoPreview ? (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        className="btn-ghost-premium"
                        onClick={async () => {
                          if (videoFileId) {
                            const deletion = await deleteFileAssetAction(videoFileId);

                            if (deletion.error) {
                              toast.error(deletion.error);
                              return;
                            }
                          }

                          setVideoPreview(null);
                          setVideoFileId("");
                        }}
                      >
                        Remove video
                      </Button>
                    </div>
                  ) : null}
                </div>
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="flex justify-end">
            <DashboardActionSubmitButton
              idleLabel={mode === "edit" ? "Update testimony" : "Save testimony"}
              pendingLabel="Saving..."
              className="btn-primary rounded-xl px-5"
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
