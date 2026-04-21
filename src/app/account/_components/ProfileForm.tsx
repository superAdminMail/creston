"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormFieldWrapper } from "@/components/ui/form-field-wrapper";
import { UploadButton } from "@/utils/uploadthing";
import { getUserInitials } from "@/lib/User-Initials/user";
import {
  updateUserSchema,
  updateUserSchemaType,
} from "@/lib/zodValidations/user";
import { deleteProfileAvatarAction, updateUserProfile } from "@/actions/auth/user";
import { type UserDTO } from "@/lib/types";
import { CURRENT_USER_QUERY_KEY } from "@/stores/useCurrentUserQuery";

type Props = {
  userData: UserDTO;
};

export default function ProfileForm({ userData }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deletingKeys, setDeletingKeys] = useState<Set<string>>(new Set());
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<updateUserSchemaType>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: userData.name ?? "",
      username: userData.username ?? "",
      profileAvatar: userData.profileAvatar ?? undefined,
    },
  });

  const { control, handleSubmit, setValue, getValues, clearErrors, setError } =
    form;

  const onSubmit = (values: updateUserSchemaType) => {
    startTransition(async () => {
      clearErrors();

      const res = await updateUserProfile(values);

      if (res?.fieldErrors) {
        Object.entries(res.fieldErrors).forEach(([fieldName, messages]) => {
          const message = messages?.[0];

          if (!message) return;

          setError(fieldName as keyof updateUserSchemaType, {
            type: "server",
            message,
          });
        });
      }

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      const nextProfileAvatar = form.getValues("profileAvatar");

      queryClient.setQueryData<UserDTO | null>(CURRENT_USER_QUERY_KEY, (current) => {
        const base = current ?? userData;

        return {
          ...base,
          name: values.name ?? base?.name ?? null,
          username: values.username ?? base?.username ?? null,
          image: base?.image ?? null,
          profileAvatar: nextProfileAvatar
            ? {
                url: nextProfileAvatar.url,
                key: nextProfileAvatar.key,
              }
            : base?.profileAvatar ?? null,
        };
      });
      void queryClient.invalidateQueries({
        queryKey: CURRENT_USER_QUERY_KEY,
      });

      toast.success("Profile updated");
      router.refresh();
      router.push("/account/dashboard/profile");
    });
  };

  const deleteProfileImage = async () => {
    const image = getValues("profileAvatar");
    if (!image?.key) return;
    if (deletingKeys.has(image.key)) return;

    setDeletingKeys((previous) => new Set(previous).add(image.key));

    try {
      await deleteProfileAvatarAction();
      setValue("profileAvatar", null, { shouldDirty: true });

      queryClient.setQueryData<UserDTO | null>(CURRENT_USER_QUERY_KEY, (current) => {
        const base = current ?? userData;

        return {
          ...base,
          image: base?.image ?? null,
          profileAvatar: null,
        };
      });
      void queryClient.invalidateQueries({
        queryKey: CURRENT_USER_QUERY_KEY,
      });

      toast.success("Profile image removed");
      router.refresh();
    } catch {
      toast.error("Failed to remove image");
    } finally {
      setDeletingKeys((previous) => {
        const next = new Set(previous);
        next.delete(image.key);
        return next;
      });
    }
  };

  const avatar =
    form.watch("profileAvatar")?.url ?? userData.profileAvatar?.url ?? userData.image ?? null;

  const initials = getUserInitials({
    name: userData.name ?? null,
    username: userData.username ?? null,
    email: userData.email ?? null,
  });

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <section className="border-t pt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-32 w-32">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Profile image"
                    fill
                    className="rounded-full border object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full border text-sm text-muted-foreground">
                    <div className="text-xl font-semibold uppercase">
                      {initials}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                <UploadButton
                  endpoint="profileAvatar"
                  onClientUploadComplete={async (res) => {
                    const file = res[0];
                    if (!file) {
                      toast.error("Upload failed");
                      return;
                    }

                    setValue(
                      "profileAvatar",
                      { url: file.url, key: file.key },
                      { shouldDirty: true },
                    );

                    const result = await updateUserProfile({
                      profileAvatar: { url: file.url, key: file.key },
                    });

                    if (result.error) {
                      toast.error(result.error);
                      return;
                    }

                    queryClient.setQueryData<UserDTO | null>(CURRENT_USER_QUERY_KEY, (current) => {
                      const base = current ?? userData;

                      return {
                        ...base,
                        image: base?.image ?? null,
                        profileAvatar: {
                          url: file.url,
                          key: file.key,
                        },
                      };
                    });
                    void queryClient.invalidateQueries({
                      queryKey: CURRENT_USER_QUERY_KEY,
                    });

                    toast.success("Profile image updated");
                    router.refresh();
                  }}
                  className="
                    ut-button:!inline-flex
                    ut-button:!items-center
                    ut-button:!gap-2
                    ut-button:!rounded-full
                    ut-button:!border
                    ut-button:!border-blue-300/30
                    ut-button:!bg-slate-950
                    ut-button:!px-5
                    ut-button:!py-2.5
                    ut-button:!text-sm
                    ut-button:!font-semibold
                    ut-button:!text-white
                    ut-button:!shadow-[0_12px_28px_rgba(2,6,23,0.42)]
                    ut-button:!ring-1
                    ut-button:!ring-inset
                    ut-button:!ring-white/10
                    ut-button:transition
                    ut-button:duration-200
                    hover:ut-button:!-translate-y-0.5
                    hover:ut-button:!bg-blue-600
                    hover:ut-button:!shadow-[0_16px_36px_rgba(37,99,235,0.34)]
                  "
                />

                {avatar ? (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={deletingKeys.has(
                      form.watch("profileAvatar")?.key ?? "",
                    )}
                    onClick={deleteProfileImage}
                    className="text-sm text-red-600"
                  >
                    Remove photo
                  </Button>
                ) : null}
              </div>
            </div>
          </section>

          <FormFieldWrapper control={control} name="name" label="Full Name">
            {(field) => (
              <Input
                {...field}
                placeholder="John Doe"
                className="border-white/10 bg-white/[0.04] focus:border-blue-400"
              />
            )}
          </FormFieldWrapper>

          <FormFieldWrapper control={control} name="username" label="Username">
            {(field) => (
              <Input
                {...field}
                placeholder="johndoe"
                className="border-white/10 bg-white/[0.04] focus:border-blue-400"
              />
            )}
          </FormFieldWrapper>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Email
            </p>
            <p className="mt-2">{userData.email}</p>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white hover:bg-blue-500"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
