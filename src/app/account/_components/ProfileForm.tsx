"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { cn } from "@/lib/utils";
import { getUserInitials } from "@/lib/User-Initials/user";
import {
  updateUserSchema,
  updateUserSchemaType,
} from "@/lib/zodValidations/user";
import {
  deleteProfileAvatarAction,
  updateUserProfile,
} from "@/actions/auth/user";
import { type UserDTO } from "@/lib/types";
import { CURRENT_USER_QUERY_KEY } from "@/stores/useCurrentUserQuery";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "@/app/account/dashboard/_components/dashboardSurfaces";

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
  const profileAvatar = useWatch({
    control,
    name: "profileAvatar",
  });

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

      queryClient.setQueryData<UserDTO | null>(
        CURRENT_USER_QUERY_KEY,
        (current) => {
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
              : (base?.profileAvatar ?? null),
          };
        },
      );
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

      queryClient.setQueryData<UserDTO | null>(
        CURRENT_USER_QUERY_KEY,
        (current) => {
          const base = current ?? userData;

          return {
            ...base,
            image: base?.image ?? null,
            profileAvatar: null,
          };
        },
      );
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
    profileAvatar?.url ?? userData.profileAvatar?.url ?? userData.image ?? null;

  const initials = getUserInitials({
    name: userData.name ?? null,
    username: userData.username ?? null,
    email: userData.email ?? null,
  });

  return (
    <Card
      className={cn(
        DASHBOARD_PAGE_SURFACE_CLASS,
        "overflow-hidden rounded-[1.9rem]",
      )}
    >
      <CardHeader className="flex items-center justify-between border-b border-slate-200/70 px-7 py-6 dark:border-white/10">
        <CardTitle className="text-slate-950 dark:text-white">
          Personal Information
        </CardTitle>
      </CardHeader>

      <CardContent className="p-7 sm:p-8 lg:p-9">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          <section className="dark:border-white/10">
            <div className="flex flex-col items-center gap-5">
              <div className="relative h-32 w-32">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Profile image"
                    fill
                    className="rounded-full border border-slate-200/80 object-cover dark:border-white/10"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                    <div className="text-xl font-semibold uppercase text-slate-950 dark:text-white">
                      {initials}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                <UploadButton
                  endpoint="profileAvatar"
                  className="ut-button:inline-flex ut-button:h-11 ut-button:items-center ut-button:justify-center ut-button:rounded-full ut-button:border ut-button:border-slate-200 ut-button:bg-white ut-button:px-5 ut-button:text-sm ut-button:font-semibold ut-button:text-slate-900 ut-button:shadow-sm ut-button:transition ut-button:hover:-translate-y-0.5 ut-button:hover:bg-slate-50 ut-button:hover:text-slate-950 ut-button:disabled:translate-y-0 ut-button:disabled:opacity-60 dark:ut-button:border-white/10 dark:ut-button:bg-slate-950 dark:ut-button:text-white dark:ut-button:hover:bg-slate-900"
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

                    queryClient.setQueryData<UserDTO | null>(
                      CURRENT_USER_QUERY_KEY,
                      (current) => {
                        const base = current ?? userData;

                        return {
                          ...base,
                          image: base?.image ?? null,
                          profileAvatar: {
                            url: file.url,
                            key: file.key,
                          },
                        };
                      },
                    );
                    void queryClient.invalidateQueries({
                      queryKey: CURRENT_USER_QUERY_KEY,
                    });

                    toast.success("Profile image updated");
                    router.refresh();
                  }}
                />

                {avatar ? (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={deletingKeys.has(profileAvatar?.key ?? "")}
                    onClick={deleteProfileImage}
                    className="text-sm text-red-600 dark:text-red-300"
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
                className="super-admin-field rounded-2xl focus-visible:ring-sky-400/20"
              />
            )}
          </FormFieldWrapper>

          <FormFieldWrapper control={control} name="username" label="Username">
            {(field) => (
              <Input
                {...field}
                placeholder="johndoe"
                className="super-admin-field rounded-2xl focus-visible:ring-sky-400/20"
              />
            )}
          </FormFieldWrapper>

          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Email
            </p>
            <p className="mt-2 text-slate-950 dark:text-white">
              {userData.email}
            </p>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="bg-[#3c9ee0] px-5 text-white hover:bg-[#2f8bd0]"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
