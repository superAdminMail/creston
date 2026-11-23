"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  CheckCircle2,
  ImagePlus,
  Mail,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const FORM_SECTION_CLASS = cn(
  DASHBOARD_PAGE_SURFACE_CLASS,
  "rounded-[1.75rem] p-5 sm:p-6",
);

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
      <CardContent className="p-4 sm:p-6 lg:p-7">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <section className={FORM_SECTION_CLASS}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative mx-auto h-28 w-28 shrink-0 sm:mx-0 sm:h-32 sm:w-32">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Profile image"
                    fill
                    sizes="128px"
                    className="rounded-full border border-slate-200/80 object-cover dark:border-white/10"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-2xl font-semibold uppercase text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
                    {initials}
                  </div>
                )}

                <div className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#3c9ee0] text-white shadow-sm dark:border-slate-950">
                  <Camera className="h-4 w-4" />
                </div>
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-sky-700 dark:text-sky-300">
                  Profile appearance
                </p>

                <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                  Profile Photo
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Upload a clear photo.
                </p>

                <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row">
                  <div className="inline-flex items-center rounded-xl bg-slate-800 p-1.5 shadow-sm dark:bg-black">
                    <UploadButton
                      endpoint="profileAvatar"
                      onClientUploadComplete={async (res) => {
                        const file = res?.[0];

                        if (!file) {
                          toast.error("Upload failed");
                          return;
                        }

                        const avatar = {
                          url: file.ufsUrl,
                          key: file.key,
                        };

                        setValue("profileAvatar", avatar, {
                          shouldDirty: true,
                        });

                        const result = await updateUserProfile({
                          profileAvatar: avatar,
                        });

                        if (result?.error) {
                          toast.error(result.error);
                          return;
                        }

                        queryClient.setQueryData(
                          CURRENT_USER_QUERY_KEY,
                          (old: any) =>
                            old
                              ? {
                                  ...old,
                                  profileAvatar: avatar,
                                  image: avatar.url,
                                }
                              : old,
                        );

                        queryClient.invalidateQueries({
                          queryKey: CURRENT_USER_QUERY_KEY,
                        });
                        toast.success("Profile photo updated");
                        router.refresh();
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(error.message);
                      }}
                      appearance={{
                        button: "bg-transparent text-white hover:bg-slate-700",
                        allowedContent: "text-slate-300",
                      }}
                      content={{
                        button: "Upload photo",
                      }}
                    />
                  </div>

                  {avatar ? (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={deletingKeys.has(profileAvatar?.key ?? "")}
                      onClick={deleteProfileImage}
                      className="rounded-full text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-400/10 dark:hover:text-red-200"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove photo
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section className={FORM_SECTION_CLASS}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
                <UserRound className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                  Personal Details
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Update the name and username associated with your account.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <FormFieldWrapper control={control} name="name" label="Full Name">
                {(field) => (
                  <Input
                    {...field}
                    placeholder="John Doe"
                    className="super-admin-field rounded-2xl focus-visible:ring-sky-400/20"
                  />
                )}
              </FormFieldWrapper>

              <FormFieldWrapper
                control={control}
                name="username"
                label="Username"
              >
                {(field) => (
                  <Input
                    {...field}
                    placeholder="johndoe"
                    className="super-admin-field rounded-2xl focus-visible:ring-sky-400/20"
                  />
                )}
              </FormFieldWrapper>
            </div>
          </section>

          <section className={FORM_SECTION_CLASS}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                <Mail className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                  Account Email
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your registered email address.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.04]">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Email address
                </p>
                <p className="mt-2 break-all text-sm font-medium text-slate-950 dark:text-white">
                  {userData.email}
                </p>
              </div>

              <div className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Registered
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-4 border-t border-slate-200/70 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
            <div>
              <p className="text-sm font-medium text-slate-950 dark:text-white">
                Ready to save your changes?
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Your updated details will be reflected across your account.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full rounded-2xl bg-[#3c9ee0] px-6 text-white shadow-[0_10px_30px_rgba(37,99,235,0.18)] hover:bg-[#2f8bd0] sm:w-auto"
            >
              <Save className="mr-2 h-4 w-4" />
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
