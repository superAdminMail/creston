"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getAgeFromIsoDate } from "@/lib/age";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import {
  onboardingSchema,
  type OnboardingSchemaInput,
  type OnboardingSchemaType,
} from "@/lib/zod/onboarding";
import { createInvestorProfileAction } from "@/actions/onboarding/create-investor-profile";

type InvestmentProfileFormProps = {
  onCreateLater?: () => Promise<void>;
  initialValues?: Partial<OnboardingSchemaInput>;
  onSubmitAction?: (values: OnboardingSchemaType) => Promise<{ success: true }>;
  submitLabel?: string;
  pendingLabel?: string;
  successMessage?: string;
};

export function InvestmentProfileForm({
  onCreateLater,
  initialValues,
  onSubmitAction = createInvestorProfileAction,
  submitLabel = "Save and continue",
  pendingLabel = "Saving...",
  successMessage = "Investment profile saved.",
}: InvestmentProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<OnboardingSchemaInput, unknown, OnboardingSchemaType>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      countryCallingCode: "+1",
      phoneNumber: "",
      dateOfBirth: "",
      confirmAdultAge: false,
      country: "United States",
      state: "",
      city: "",
      addressLine1: "",
      addressLine2: "",
      ...initialValues,
    },
  });

  const handleSubmit = (values: OnboardingSchemaType) => {
    startTransition(async () => {
      try {
        await onSubmitAction(values);
        toast.success(successMessage);
        router.push("/account/dashboard/user/profile");
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "We could not save your investment profile. Please try again.";

        toast.error(message);
      }
    });
  };

  const selectedDateOfBirth = useWatch({
    control: form.control,
    name: "dateOfBirth",
  });
  const derivedAge = getAgeFromIsoDate(selectedDateOfBirth);
  const isAdult = derivedAge !== null && derivedAge >= 18;
  const hasConfirmedAdultAge = useWatch({
    control: form.control,
    name: "confirmAdultAge",
    defaultValue: false,
  });

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
      <FieldGroup>
        <Field>
          <FieldLabel>Phone number</FieldLabel>
          <FieldContent>
            <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
              <Controller
                control={form.control}
                name="countryCallingCode"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldContent>
                      <Input
                        {...field}
                        disabled={isPending}
                        inputMode="tel"
                        placeholder="+1"
                        className="input-premium h-11 rounded-xl"
                      />
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="phoneNumber"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldContent>
                      <Input
                        {...field}
                        disabled={isPending}
                        inputMode="tel"
                        autoComplete="tel-national"
                        placeholder="555 123 4567"
                        className="input-premium h-11 rounded-xl"
                      />
                    </FieldContent>
                  </Field>
                )}
              />
            </div>
            <FieldDescription>
              Enter a country code and local number. We will save it in E.164
              format.
            </FieldDescription>
            <FieldError
              errors={[
                form.formState.errors.countryCallingCode,
                form.formState.errors.phoneNumber,
              ]}
            />
          </FieldContent>
        </Field>

        <Controller
          control={form.control}
          name="dateOfBirth"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel>Date of birth</FieldLabel>
              <FieldContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      className={cn(
                        "input-premium h-11 w-full justify-between rounded-xl border text-left font-normal hover:bg-white/5",
                        !field.value && "text-slate-400",
                      )}
                    >
                      <span>
                        {field.value
                          ? format(parseISO(field.value), "MMMM d, yyyy")
                          : "Select date of birth"}
                      </span>
                      <CalendarIcon className="h-4 w-4 text-slate-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-auto border-white/10 bg-[var(--card)] p-0 text-[var(--foreground)]"
                  >
                    <Calendar
                      mode="single"
                      selected={field.value ? parseISO(field.value) : undefined}
                      onSelect={(date) => {
                        const nextDate = date ? format(date, "yyyy-MM-dd") : "";

                        field.onChange(nextDate);
                        form.setValue("confirmAdultAge", false, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      captionLayout="dropdown"
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                    />
                  </PopoverContent>
                </Popover>
                {fieldState.error ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="confirmAdultAge"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel className="items-start gap-3 rounded-xl border border-white/8 px-4 py-3">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    const nextValue = checked === true;

                    field.onChange(nextValue);
                    if (nextValue) {
                      form.clearErrors("confirmAdultAge");
                    } else {
                      void form.trigger("confirmAdultAge");
                    }
                  }}
                  disabled={isPending || !derivedAge || !isAdult}
                  className="mt-0.5 border-white/20 data-[state=checked]:border-[var(--primary)] data-[state=checked]:bg-[var(--primary)]"
                />
                <div className="space-y-1">
                  <span className="text-sm font-medium text-white">
                    {derivedAge
                      ? `Yes, I confirm I am ${derivedAge} years old.`
                      : "Select your date of birth to confirm your age."}
                  </span>
                  <FieldDescription className="text-sm text-slate-400">
                    {derivedAge && !isAdult
                      ? "Havenstone onboarding is only available to adults age 18 and above."
                      : "We use this confirmation to verify age eligibility before account setup."}
                  </FieldDescription>
                </div>
              </FieldLabel>
              {fieldState.error ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
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
                  placeholder="United States"
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
                  placeholder="California"
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
                  placeholder="Los Angeles"
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
                  placeholder="123 Main Street"
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
        {onCreateLater ? (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                try {
                  await onCreateLater();
                  toast.success("Onboarding skipped for now.");
                } catch (error) {
                  const message =
                    error instanceof Error
                      ? error.message
                      : "We could not skip onboarding right now. Please try again.";

                  toast.error(message);
                }
              });
            }}
            className="btn-secondary rounded-xl"
          >
            Create later
          </Button>
        ) : null}

        <Button
          type="submit"
          disabled={isPending || !isAdult || !hasConfirmedAdultAge}
          className="btn-primary rounded-xl"
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {pendingLabel}
            </span>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
