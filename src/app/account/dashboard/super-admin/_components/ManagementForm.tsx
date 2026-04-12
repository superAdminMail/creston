"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { UploadButton } from "@/utils/uploadthing";
import { createFileAssetFromUpload } from "@/actions/files/createFileAssetFromUpload";
import { deleteFileAction } from "@/actions/files/file";
import {
  ManagementFormActionState,
  initialManagementFormState,
} from "@/actions/super-admin/management/managementForm.state";

import { createManagement } from "@/actions/super-admin/management/createManagement";
import { updateManagement } from "@/actions/super-admin/management/updateManagement";

type ManagementFormMode = "create" | "edit";

type ManagementFormProps = {
  mode?: ManagementFormMode;
  managementId?: string;
  defaultValues?: {
    name?: string;
    title?: string;
    role?: string;
    email?: string;
    phone?: string;
    bio?: string;
    photoFileId?: string;
    sortOrder?: string;
  };
  initialPhotoUrl?: string | null;
};

/* ---------------- SUBMIT BUTTON ---------------- */
function SubmitButton({ mode }: { mode: ManagementFormMode }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="btn-primary rounded-xl px-5"
      disabled={pending}
    >
      {pending ? "Saving..." : mode === "edit" ? "Update profile" : "Save profile"}
    </Button>
  );
}

/* ---------------- FORM ---------------- */
export function ManagementForm({
  mode = "create",
  managementId,
  defaultValues,
  initialPhotoUrl = null,
}: ManagementFormProps) {
  const router = useRouter();

  const [state, formAction] = useActionState<
    ManagementFormActionState,
    FormData
  >(mode === "edit" ? updateManagement : createManagement, initialManagementFormState);

  const [photoId, setPhotoId] = useState(defaultValues?.photoFileId ?? "");
  const [preview, setPreview] = useState<string | null>(initialPhotoUrl);
  const [fileKey, setFileKey] = useState<string | null>(null);

  /* ---------------- EFFECT ---------------- */
  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.push("/account/dashboard/super-admin/management");
    }

    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      {/* HIDDEN */}
      {managementId ? (
        <input type="hidden" name="managementId" value={managementId} />
      ) : null}
      <input type="hidden" name="photoFileId" value={photoId} />

      <div className="grid gap-6 xl:grid-cols-2">
        {/* LEFT */}
        <div className="space-y-6">
          {/* GENERAL */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>

            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Full name</FieldLabel>
                  <FieldContent>
                    <Input
                      name="name"
                      placeholder="John Doe"
                      required
                      defaultValue={defaultValues?.name}
                    />
                    <FieldError>{state.fieldErrors?.name?.[0]}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Title</FieldLabel>
                  <FieldContent>
                    <Input
                      name="title"
                      placeholder="CEO"
                      defaultValue={defaultValues?.title}
                    />
                    <FieldError>{state.fieldErrors?.title?.[0]}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Role</FieldLabel>
                  <FieldContent>
                    <Input
                      name="role"
                      placeholder="Executive"
                      defaultValue={defaultValues?.role}
                    />
                    <FieldError>{state.fieldErrors?.role?.[0]}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <FieldContent>
                    <Input
                      name="email"
                      placeholder="email@example.com"
                      defaultValue={defaultValues?.email}
                    />
                    <FieldError>{state.fieldErrors?.email?.[0]}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Phone</FieldLabel>
                  <FieldContent>
                    <Input
                      name="phone"
                      placeholder="+1234567890"
                      defaultValue={defaultValues?.phone}
                    />
                    <FieldError>{state.fieldErrors?.phone?.[0]}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Sort Order</FieldLabel>
                  <FieldContent>
                    <Input
                      name="sortOrder"
                      placeholder="1"
                      defaultValue={defaultValues?.sortOrder}
                    />
                    <FieldError>{state.fieldErrors?.sortOrder?.[0]}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Bio</FieldLabel>
                  <FieldContent>
                    <textarea
                      name="bio"
                      className="input-premium min-h-[120px] w-full rounded-xl px-3 py-3"
                      placeholder="Short professional bio..."
                      defaultValue={defaultValues?.bio}
                    />
                    <FieldError>{state.fieldErrors?.bio?.[0]}</FieldError>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* IMAGE */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
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

                  setPhotoId(asset.id);
                  setPreview(file.url);
                  setFileKey(file.key);

                  toast.success("Photo uploaded");
                }}
                //onUploadError={(e) => toast.error(e.message)}
                className="
    ut-button:bg-blue-500/8
    ut-button:text-blue-600
    ut-button:border
    ut-button:border-blue-500/30
    ut-button:rounded-full
    ut-button:px-5
    ut-button:py-2
    ut-button:text-sm
    hover:ut-button:bg-blue-500/10
  "
              />

              {preview && (
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10">
                    <Image
                      src={preview}
                      alt="preview"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <Button
                    type="button"
                    className="btn-ghost-premium"
                    onClick={async () => {
                      if (!fileKey) return;

                      await deleteFileAction(fileKey);

                      setPreview(null);
                      setPhotoId("");
                      setFileKey(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ACTION */}
          <div className="flex justify-end">
            <SubmitButton mode={mode} />
          </div>
        </div>
      </div>
    </form>
  );
}
