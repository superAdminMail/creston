"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { changePassword } from "@/actions/auth/password";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changePasswordSchema } from "@/lib/zodValidations/password";

type FieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

type PasswordFormProps = {
  embedded?: boolean;
  onSuccess?: () => void;
};

export default function PasswordForm({
  embedded = false,
  onSuccess,
}: PasswordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const updateField =
    (field: keyof FieldErrors, setter: (value: string) => void) =>
    (value: string) => {
      setter(value);
      setFieldErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;

      setFieldErrors({
        currentPassword: flattened.currentPassword?.[0],
        newPassword: flattened.newPassword?.[0],
        confirmPassword: flattened.confirmPassword?.[0],
      });
      toast.error("Please review the highlighted password fields.");
      return;
    }

    setFieldErrors({});

    startTransition(async () => {
      const result = await changePassword(parsed.data);

      if (result?.fieldErrors) {
        setFieldErrors({
          currentPassword: result.fieldErrors.currentPassword?.[0],
          newPassword: result.fieldErrors.newPassword?.[0],
          confirmPassword: result.fieldErrors.confirmPassword?.[0],
        });
      }

      if (result?.error) {
        toast.error(result.error, { id: "password-change-error" });
        return;
      }

      toast.success("Password updated successfully.", {
        id: "password-change-success",
      });
      setFieldErrors({});
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onSuccess?.();
    });
  };

  const formContent = (
    <>
      {!embedded ? (
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Update your account password and keep your Havenstone access secure.
          </CardDescription>
        </CardHeader>
      ) : null}

      <CardContent className={embedded ? "px-0 pb-0 pt-1" : undefined}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup className="gap-5">
            <Field data-invalid={Boolean(fieldErrors.currentPassword)}>
              <FieldLabel className="text-slate-100">
                Current password
              </FieldLabel>
              <FieldContent>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(event) =>
                    updateField("currentPassword", setCurrentPassword)(
                      event.target.value,
                    )
                  }
                  className="input-premium h-11 rounded-xl"
                  autoComplete="current-password"
                />
                <FieldError>{fieldErrors.currentPassword}</FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(fieldErrors.newPassword)}>
              <FieldLabel className="text-slate-100">New password</FieldLabel>
              <FieldContent>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    updateField("newPassword", setNewPassword)(
                      event.target.value,
                    )
                  }
                  className="input-premium h-11 rounded-xl"
                  autoComplete="new-password"
                />
                <FieldError>{fieldErrors.newPassword}</FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={Boolean(fieldErrors.confirmPassword)}>
              <FieldLabel className="text-slate-100">
                Confirm new password
              </FieldLabel>
              <FieldContent>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    updateField("confirmPassword", setConfirmPassword)(
                      event.target.value,
                    )
                  }
                  className="input-premium h-11 rounded-xl"
                  autoComplete="new-password"
                />
                {fieldErrors.confirmPassword ? (
                  <FieldError>{fieldErrors.confirmPassword}</FieldError>
                ) : (
                  <FieldDescription className="text-slate-400">
                    Use a strong password with at least 6 characters.
                  </FieldDescription>
                )}
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="btn-primary rounded-xl px-5"
              disabled={isPending}
            >
              {isPending ? "Updating..." : "Change password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );

  if (embedded) {
    return <div className="text-white">{formContent}</div>;
  }

  return (
    <Card className="border-white/8 bg-[#08101d]/96 text-white shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
      {formContent}
    </Card>
  );
}
