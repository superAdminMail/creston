"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { AuthShell } from "@/app/auth/_components/AuthShell";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getDashboardHomeByRole } from "@/lib/auth/dashboard-home";
import { getSession, signIn } from "@/lib/auth-client";
import {
  loginUserSchema,
  loginUserSchemaType,
} from "@/lib/zodValidations/user";

type LoginFormProps = {
  siteName: string;
  siteLogoUrl?: string | null;
  successHref: string;
  eyebrow: string;
  title: string;
  description: string;
  footer?: React.ReactNode;
};

export default function LoginForm({
  siteName,
  siteLogoUrl,
  successHref,
  eyebrow,
  title,
  description,
  footer,
}: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<loginUserSchemaType>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = (values: loginUserSchemaType) => {
    setError(undefined);

    startTransition(async () => {
      const { error } = await signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setError(error.message ?? "Invalid credentials");
        form.reset();
        return;
      }

      const sessionResult = await getSession();
      const session =
        sessionResult && "data" in sessionResult ? sessionResult.data : null;
      const sessionRole = (
        session?.user as { role?: string | null } | undefined
      )?.role;
      const targetHref = sessionRole
        ? getDashboardHomeByRole(sessionRole)
        : successHref;

      router.replace(targetHref);
      router.refresh();
    });
  };

  return (
    <AuthShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      siteName={siteName}
      siteLogoUrl={siteLogoUrl}
      footer={footer}
    >
      <div className="space-y-6">
        {error ? (
          <Alert className="rounded-2xl border border-red-400/20 bg-red-400/10 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        ) : null}

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          onChange={() => {
            if (error) setError(undefined);
          }}
          noValidate
          className="space-y-6"
        >
          <FieldGroup className="gap-5">
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel className="text-sm font-medium text-slate-200">
                    Email
                  </FieldLabel>

                  <FieldContent>
                    <Input
                      {...field}
                      disabled={isPending}
                      type="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      aria-invalid={fieldState.invalid}
                      className="input-premium h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 text-white placeholder:text-slate-500 focus-visible:ring-[var(--ring)]"
                    />

                    {!fieldState.error ? (
                      <FieldDescription className="text-xs text-slate-500">
                        Enter the email associated with your {siteName} account.
                      </FieldDescription>
                    ) : null}

                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel className="text-sm font-medium text-slate-200">
                    Password
                  </FieldLabel>

                  <FieldContent>
                    <div className="relative">
                      <Input
                        {...field}
                        disabled={isPending}
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        aria-invalid={fieldState.invalid}
                        className="input-premium h-12 rounded-2xl border-white/10 bg-white/[0.03] px-4 pr-12 text-white placeholder:text-slate-500 focus-visible:ring-[var(--ring)]"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={isPending}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:text-blue-200 disabled:pointer-events-none disabled:opacity-60"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <div className="mt-2 flex justify-end">
                      <Link
                        href="/auth/forgot-password"
                        className="text-xs text-slate-500 transition hover:text-blue-200"
                      >
                        Forgot your password?
                      </Link>
                    </div>

                    {!fieldState.error ? (
                      <FieldDescription className="text-xs text-slate-500">
                        Use the password created during account setup.
                      </FieldDescription>
                    ) : null}

                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>

          <Button
            disabled={isPending}
            type="submit"
            className="btn-primary h-12 w-full rounded-2xl text-sm font-semibold text-white disabled:opacity-70"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
