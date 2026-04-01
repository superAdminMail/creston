"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import {
  onboardingSchema,
  type OnboardingSchemaType,
} from "@/lib/zod/onboarding";
import { createInvestorProfileAction } from "@/actions/onboarding/create-investor-profile";

type InvestmentProfileFormProps = {
  onCreateLater: () => Promise<void>;
};

export function InvestmentProfileForm({
  onCreateLater,
}: InvestmentProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<OnboardingSchemaType>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      phoneNumber: "",
      dateOfBirth: "",
      country: "",
      state: "",
      city: "",
      addressLine1: "",
      addressLine2: "",
    },
  });

  const handleSubmit = (values: OnboardingSchemaType) => {
    startTransition(async () => {
      await createInvestorProfileAction(values);
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
      <FieldGroup>
        <Controller
          control={form.control}
          name="phoneNumber"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>Phone number</FieldLabel>
              <FieldContent>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="+234..."
                  className="input-premium h-11 rounded-xl"
                />
                {fieldState.error ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="dateOfBirth"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>Date of birth</FieldLabel>
              <FieldContent>
                <Input
                  {...field}
                  type="date"
                  disabled={isPending}
                  className="input-premium h-11 rounded-xl"
                />
                {fieldState.error ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="country"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>Country</FieldLabel>
              <FieldContent>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Nigeria"
                  className="input-premium h-11 rounded-xl"
                />
                {fieldState.error ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="state"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>State</FieldLabel>
              <FieldContent>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="FCT Abuja"
                  className="input-premium h-11 rounded-xl"
                />
                {fieldState.error ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="city"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>City</FieldLabel>
              <FieldContent>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Abuja"
                  className="input-premium h-11 rounded-xl"
                />
                {fieldState.error ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="addressLine1"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>Address line 1</FieldLabel>
              <FieldContent>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Street address"
                  className="input-premium h-11 rounded-xl"
                />
                {fieldState.error ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="addressLine2"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>Address line 2</FieldLabel>
              <FieldContent>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Apartment, suite, unit"
                  className="input-premium h-11 rounded-xl"
                />
                {fieldState.error ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              await onCreateLater();
            });
          }}
          className="btn-secondary rounded-xl"
        >
          Create later
        </Button>

        <Button
          type="submit"
          disabled={isPending}
          className="btn-primary rounded-xl"
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            "Save and continue"
          )}
        </Button>
      </div>
    </form>
  );
}
