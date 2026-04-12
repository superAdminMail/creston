"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { createFileAssetFromUpload } from "@/actions/files/createFileAssetFromUpload";
import { deleteFileAction } from "@/actions/files/file";
import type { TestimonyFormActionState } from "@/actions/admin/testimonies/testimonyForm.state";
import { initialTestimonyFormState } from "@/actions/admin/testimonies/testimonyForm.state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UploadButton } from "@/utils/uploadthing";

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
    sortOrder?: string;
    isFeatured?: boolean;
  };
  initialAvatarUrl?: string | null;
  formAction: (
    state: TestimonyFormActionState,
    formData: FormData,
  ) => Promise<TestimonyFormActionState>;
};

function SubmitButton({ mode }: { mode: TestimonyFormMode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="btn-primary rounded-xl px-5" disabled={pending}>
      {pending ? "Saving..." : mode === "edit" ? "Update testimony" : "Save testimony"}
    </Button>
  );
}

export function TestimonyForm({
  mode = "create",
  testimonyId,
  defaultValues,
  initialAvatarUrl = null,
  formAction,
}: TestimonyFormProps) {
  const [state, action] = useActionState(formAction, initialTestimonyFormState);
  const [avatarFileId, setAvatarFileId] = useState(defaultValues?.avatarFileId ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialAvatarUrl);
  const [avatarStorageKey, setAvatarStorageKey] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(defaultValues?.isFeatured ?? false);
  const [status, setStatus] = useState(defaultValues?.status ?? "DRAFT");

  useEffect(() => {
    if (state.status === "success" && state.message) {
      toast.success(state.message);
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Card className="rounded-[2rem] border border-white/10 bg-[#08101d]/96 shadow-[0_24px_70px_rgba(2,6,23,0.32)]">
      <CardHeader>
        <CardTitle className="text-white">
          {mode === "edit" ? "Edit testimony" : "Create testimony"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          {testimonyId ? <input type="hidden" name="testimonyId" value={testimonyId} /> : null}
          <input type="hidden" name="avatarFileId" value={avatarFileId} />
          <input type="hidden" name="isFeatured" value={String(isFeatured)} />
          <input type="hidden" name="status" value={status} />

          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel className="text-slate-100">Full name</FieldLabel>
              <FieldContent>
                <Input name="fullName" defaultValue={defaultValues?.fullName} className="input-premium h-11 rounded-xl" />
                <FieldError>{state.fieldErrors?.fullName?.[0]}</FieldError>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-slate-100">Role or title</FieldLabel>
              <FieldContent>
                <Input name="roleOrTitle" defaultValue={defaultValues?.roleOrTitle} className="input-premium h-11 rounded-xl" />
                <FieldError>{state.fieldErrors?.roleOrTitle?.[0]}</FieldError>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-slate-100">Message</FieldLabel>
              <FieldContent>
                <textarea
                  name="message"
                  defaultValue={defaultValues?.message}
                  rows={5}
                  className="input-premium min-h-32 w-full rounded-xl px-3 py-3"
                />
                <FieldError>{state.fieldErrors?.message?.[0]}</FieldError>
              </FieldContent>
            </Field>

            <div className="grid gap-5 lg:grid-cols-2">
              <Field>
                <FieldLabel className="text-slate-100">Rating</FieldLabel>
                <FieldContent>
                  <Input name="rating" defaultValue={defaultValues?.rating} placeholder="5" className="input-premium h-11 rounded-xl" />
                  <FieldError>{state.fieldErrors?.rating?.[0]}</FieldError>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel className="text-slate-100">Sort order</FieldLabel>
                <FieldContent>
                  <Input name="sortOrder" defaultValue={defaultValues?.sortOrder} placeholder="0" className="input-premium h-11 rounded-xl" />
                  <FieldError>{state.fieldErrors?.sortOrder?.[0]}</FieldError>
                </FieldContent>
              </Field>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Field>
                <FieldLabel className="text-slate-100">Featured</FieldLabel>
                <FieldContent>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">Show as featured</p>
                      <p className="text-xs text-slate-400">Promote this testimony on the public site.</p>
                    </div>
                    <Switch checked={isFeatured} onCheckedChange={(checked) => setIsFeatured(checked === true)} />
                  </div>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel className="text-slate-100">Status</FieldLabel>
                <FieldContent>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="input-premium h-11 w-full rounded-xl px-3 text-sm"
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
              <FieldLabel className="text-slate-100">Avatar</FieldLabel>
              <FieldContent>
                <UploadButton
                  endpoint="photoManager"
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

                    setAvatarFileId(asset.id);
                    setAvatarPreview(file.url);
                    setAvatarStorageKey(file.key);
                  }}
                  className="ut-button:bg-blue-600 ut-button:text-white ut-button:rounded-full ut-button:px-5 ut-button:py-2"
                />

                {avatarPreview ? (
                  <div className="mt-4 flex items-center gap-4">
                    <Image src={avatarPreview} alt="avatar preview" width={56} height={56} className="rounded-xl object-cover" />
                    <Button
                      type="button"
                      className="btn-ghost-premium"
                      onClick={async () => {
                        if (!avatarStorageKey) return;
                        await deleteFileAction(avatarStorageKey);
                        setAvatarPreview(null);
                        setAvatarFileId("");
                        setAvatarStorageKey(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : null}

                <FieldError>{state.fieldErrors?.avatarFileId?.[0]}</FieldError>
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="flex justify-end">
            <SubmitButton mode={mode} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
