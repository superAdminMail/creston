"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  AddressAutofillCore,
  type AddressAutofillSuggestion,
} from "@mapbox/search-js-core";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getAgeFromIsoDate } from "@/lib/formatters/age";
import { getDefaultCountryCallingCode } from "@/lib/formatters/phone";
import {
  mapMapboxAddressToOnboardingFields,
  type OnboardingAddressFields,
} from "@/lib/mapbox/onboarding-address";
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
import { DASHBOARD_FIELD_CLASS } from "@/app/account/dashboard/_components/dashboardSurfaces";
import { cn } from "@/lib/utils";

import {
  onboardingSchema,
  type OnboardingSchemaInput,
  type OnboardingSchemaType,
} from "@/lib/zodValidations/onboarding";
import { createInvestorProfileAction } from "@/actions/onboarding/create-investor-profile";
import type { UpsertCurrentUserInvestorProfileResult } from "@/actions/profile/upsert-current-user-investor-profile";
import { CURRENT_USER_QUERY_KEY } from "@/stores/useCurrentUserQuery";

const MAPBOX_PUBLIC_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() ?? "";

function createAddressSessionToken() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const fallbackBytes = new Uint32Array(2);
  globalThis.crypto?.getRandomValues?.(fallbackBytes);

  return `${fallbackBytes[0].toString(36)}-${fallbackBytes[1].toString(36)}`;
}

type InvestmentProfileFormProps = {
  onCreateLater?: () => Promise<void>;
  initialValues?: Partial<OnboardingSchemaInput>;
  onSubmitAction?: (
    values: OnboardingSchemaType,
  ) => Promise<UpsertCurrentUserInvestorProfileResult>;
  submitLabel?: string;
  pendingLabel?: string;
  successMessage?: string;
  compactFields?: boolean;
  tone?: "onboarding" | "dashboard";
  redirectHref?: string;
  siteName?: string;
};

export function InvestmentProfileForm({
  onCreateLater,
  initialValues,
  onSubmitAction = createInvestorProfileAction,
  submitLabel = "Save and continue",
  pendingLabel = "Saving...",
  successMessage = "Investment profile saved.",
  compactFields = false,
  tone = "onboarding",
  redirectHref,
  siteName,
}: InvestmentProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const router = useRouter();
  const initialCountry = initialValues?.country ?? "United States";
  const previousCountryRef = useRef(initialCountry);
  const addressAutofill = useMemo(
    () =>
      MAPBOX_PUBLIC_TOKEN
        ? new AddressAutofillCore({ accessToken: MAPBOX_PUBLIC_TOKEN })
        : null,
    [],
  );
  const addressSessionTokenRef = useRef(createAddressSessionToken());
  const selectedAddressLineRef = useRef("");
  const hasPrefilledAddressDetails = Boolean(
    initialValues?.addressLine1?.trim() ||
    initialValues?.country?.trim() ||
    initialValues?.state?.trim() ||
    initialValues?.city?.trim(),
  );
  const [showAddressDetails, setShowAddressDetails] = useState(
    hasPrefilledAddressDetails,
  );
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressAutofillSuggestion[]
  >([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [hasAddressAutocomplete, setHasAddressAutocomplete] = useState(false);

  const form = useForm<OnboardingSchemaInput, unknown, OnboardingSchemaType>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      countryCallingCode:
        initialValues?.countryCallingCode ??
        getDefaultCountryCallingCode(initialValues?.country ?? "United States"),
      phoneNumber: "",
      dateOfBirth: "",
      confirmAdultAge: compactFields ? true : false,
      country: "United States",
      state: "",
      city: "",
      addressLine1: "",
      ...initialValues,
    },
  });

  const watchedCountry = useWatch({
    control: form.control,
    name: "country",
  });
  const watchedAddressLine1 = useWatch({
    control: form.control,
    name: "addressLine1",
  });
  const addressQuery = watchedAddressLine1?.trim() ?? "";

  const applySelectedAddress = (
    selectedAddress: OnboardingAddressFields,
    fallbackAddressLine1: string,
  ) => {
    setShowAddressDetails(true);

    const nextAddressLine1 =
      selectedAddress.addressLine1?.trim() || fallbackAddressLine1.trim();

    if (nextAddressLine1) {
      selectedAddressLineRef.current = nextAddressLine1;
      form.setValue("addressLine1", nextAddressLine1, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    if (selectedAddress.country) {
      form.setValue("country", selectedAddress.country, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    if (selectedAddress.state) {
      form.setValue("state", selectedAddress.state, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    if (selectedAddress.city) {
      form.setValue("city", selectedAddress.city, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const selectAddressSuggestion = async (
    suggestion: AddressAutofillSuggestion,
  ) => {
    if (!addressAutofill) {
      return;
    }

    try {
      const retrieved = await addressAutofill.retrieve(suggestion, {
        sessionToken: addressSessionTokenRef.current,
      });

      const selectedAddress = mapMapboxAddressToOnboardingFields(retrieved);
      if (!selectedAddress) {
        return;
      }

      const fallbackAddressLine1 =
        suggestion.place_name ??
        suggestion.full_address ??
        suggestion.description ??
        "";

      applySelectedAddress(selectedAddress, fallbackAddressLine1);
      setAddressSuggestions([]);
    } catch (error) {
      console.error(error);
      toast.error("Unable to select that address. Please try again.");
    }
  };

  useEffect(() => {
    if (previousCountryRef.current === watchedCountry) {
      return;
    }

    const previousDefault = getDefaultCountryCallingCode(
      previousCountryRef.current,
    );
    const nextDefault = getDefaultCountryCallingCode(watchedCountry);
    const currentCallingCode = form.getValues("countryCallingCode");

    if (!currentCallingCode || currentCallingCode === previousDefault) {
      form.setValue("countryCallingCode", nextDefault, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    previousCountryRef.current = watchedCountry;
  }, [form, watchedCountry]);

  useEffect(() => {
    if (!addressAutofill || !MAPBOX_PUBLIC_TOKEN || !hasAddressAutocomplete) {
      return;
    }

    if (addressQuery.length < 3) {
      queueMicrotask(() => {
        setAddressSuggestions([]);
        setIsSearchingAddress(false);
      });
      return;
    }

    if (addressQuery === selectedAddressLineRef.current) {
      setAddressSuggestions([]);
      setIsSearchingAddress(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setIsSearchingAddress(true);
        const response = await addressAutofill.suggest(addressQuery, {
          sessionToken: addressSessionTokenRef.current,
          language: "en",
        });
        setAddressSuggestions(response.suggestions ?? []);
      } catch (error) {
        console.error(error);
        setAddressSuggestions([]);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [addressAutofill, addressQuery, hasAddressAutocomplete]);

  const handleSubmit = (values: OnboardingSchemaType) => {
    startTransition(async () => {
      form.clearErrors();
      const result = await onSubmitAction(values);

      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([fieldName, messages]) => {
          const message = messages?.[0];

          if (!message) {
            return;
          }

          form.setError(fieldName as keyof OnboardingSchemaInput, {
            type: "server",
            message,
          });
        });
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.currentUser !== undefined) {
        queryClient.setQueryData(CURRENT_USER_QUERY_KEY, result.currentUser);
        void queryClient.invalidateQueries({
          queryKey: CURRENT_USER_QUERY_KEY,
        });
      }

      toast.success(successMessage);

      if (redirectHref) {
        router.push(redirectHref);
        router.refresh();
      }
    });
  };

  const selectedDateOfBirth = useWatch({
    control: form.control,
    name: "dateOfBirth",
  });
  const derivedAge = getAgeFromIsoDate(selectedDateOfBirth);
  const isAdult = derivedAge !== null && derivedAge >= 18;
  const watchedConfirmAdultAge = useWatch({
    control: form.control,
    name: "confirmAdultAge",
    defaultValue: false,
  });
  const hasConfirmedAdultAge = compactFields ? true : watchedConfirmAdultAge;
  const isDashboardTone = tone === "dashboard";
  const labelClassName = isDashboardTone
    ? "text-slate-600 dark:text-slate-300"
    : "text-white/80";
  const descriptionClassName = isDashboardTone
    ? "text-sm text-slate-500 dark:text-slate-400"
    : "text-sm text-slate-400";
  const inputClassName = cn(
    "h-11 rounded-xl",
    isDashboardTone
      ? `${DASHBOARD_FIELD_CLASS} px-3 shadow-sm focus-visible:ring-sky-400/30`
      : "input-premium",
  );
  const dateTriggerClassName = cn(
    "w-full justify-between rounded-xl border text-left font-normal transition-colors",
    isDashboardTone
      ? `${DASHBOARD_FIELD_CLASS} !text-slate-700 hover:border-sky-200/80 hover:bg-sky-50/70 hover:!text-slate-950 focus-visible:ring-sky-400/30 dark:!text-slate-200 dark:hover:bg-white/[0.06] dark:hover:!text-white`
      : "input-premium hover:bg-white/5",
  );
  const popoverContentClassName = isDashboardTone
    ? "w-auto border-border/60 bg-white p-0 text-slate-950 shadow-xl dark:bg-[var(--card)] dark:text-[var(--foreground)]"
    : "w-auto border-white/10 bg-[var(--card)] p-0 text-[var(--foreground)]";
  const suggestionPanelClassName = isDashboardTone
    ? "absolute left-0 right-0 top-full z-[70] mt-2 overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]"
    : "absolute left-0 right-0 top-full z-[70] mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(10,19,41,0.98),rgba(7,12,24,0.98))] shadow-[0_24px_70px_rgba(0,0,0,0.34)]";
  const suggestionItemClassName = isDashboardTone
    ? "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-sky-50"
    : "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-white/5";
  const suggestionTitleClassName = isDashboardTone
    ? "truncate text-sm font-medium text-slate-950"
    : "truncate text-sm font-medium text-white";
  const suggestionDescriptionClassName = isDashboardTone
    ? "mt-0.5 truncate text-xs text-slate-500"
    : "mt-0.5 truncate text-xs text-slate-400";
  const confirmationShellClassName = isDashboardTone
    ? "items-start gap-3 rounded-xl border border-border/60 bg-white/75 px-4 py-3"
    : "items-start gap-3 rounded-xl border border-white/8 px-4 py-3";
  const confirmationTextClassName = isDashboardTone
    ? "text-sm font-medium text-slate-700"
    : "text-sm font-medium text-white";
  const confirmationDescriptionClassName = isDashboardTone
    ? "text-sm text-slate-500 dark:text-slate-400"
    : "text-sm text-slate-400";
  const checkboxClassName = isDashboardTone
    ? "mt-0.5 border-border/70 data-[state=checked]:border-sky-500 data-[state=checked]:bg-sky-500"
    : "mt-0.5 border-white/20 data-[state=checked]:border-[var(--primary)] data-[state=checked]:bg-[var(--primary)]";

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
      <FieldGroup>
        <Field>
          <FieldLabel className={labelClassName}>Contact number</FieldLabel>
          <FieldContent>
            {compactFields ? (
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
                          className={inputClassName}
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
                          className={inputClassName}
                        />
                      </FieldContent>
                    </Field>
                  )}
                />
              </div>
            ) : (
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
                          className={inputClassName}
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
                          className={inputClassName}
                        />
                      </FieldContent>
                    </Field>
                  )}
                />
              </div>
            )}
            <FieldDescription className={cn("pt-1", descriptionClassName)}>
              We will use this number for important account updates and
              servicing messages.
            </FieldDescription>
            <FieldError
              errors={
                compactFields
                  ? [
                      form.formState.errors.countryCallingCode,
                      form.formState.errors.phoneNumber,
                    ]
                  : [
                      form.formState.errors.countryCallingCode,
                      form.formState.errors.phoneNumber,
                    ]
              }
            />
          </FieldContent>
        </Field>

        <Controller
          control={form.control}
          name="dateOfBirth"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel className={labelClassName}>Date of birth</FieldLabel>
              <FieldContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      className={cn(
                        dateTriggerClassName,
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
                    className={popoverContentClassName}
                  >
                    <Calendar
                      mode="single"
                      selected={field.value ? parseISO(field.value) : undefined}
                      onSelect={(date) => {
                        const nextDate = date ? format(date, "yyyy-MM-dd") : "";

                        field.onChange(nextDate);
                        form.setValue("confirmAdultAge", compactFields, {
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

        {compactFields ? null : (
          <Controller
            control={form.control}
            name="confirmAdultAge"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel className={cn(confirmationShellClassName)}>
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
                    className={checkboxClassName}
                  />
                  <div className="space-y-1">
                    <span className={confirmationTextClassName}>
                      {derivedAge
                        ? `Yes, I confirm I am ${derivedAge} years old.`
                        : "Select your date of birth to confirm your age."}
                    </span>
                    <FieldDescription
                      className={confirmationDescriptionClassName}
                    >
                      {derivedAge && !isAdult
                        ? siteName?.trim()
                          ? `${siteName.trim()} onboarding is only available to adults age 18 and above.`
                          : "Onboarding is only available to adults age 18 and above."
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
        )}

        <Controller
          control={form.control}
          name="addressLine1"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel className={labelClassName}>
                Residential address
              </FieldLabel>
              <FieldContent className="relative overflow-visible">
                {MAPBOX_PUBLIC_TOKEN ? (
                  <div className="relative z-50 overflow-visible">
                    <div className="relative overflow-visible">
                      <Input
                        value={field.value ?? ""}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          selectedAddressLineRef.current = "";
                          setHasAddressAutocomplete(true);
                          field.onChange(nextValue);
                        }}
                        disabled={isPending}
                        inputMode="text"
                        autoComplete="shipping address-line1"
                        placeholder="Start typing your address"
                        className={inputClassName}
                      />
                      {hasAddressAutocomplete &&
                        addressQuery.length >= 3 &&
                        addressQuery !== selectedAddressLineRef.current &&
                        (addressSuggestions.length > 0 ||
                          isSearchingAddress) && (
                          <div className={suggestionPanelClassName}>
                            <div className="max-h-72 overflow-auto py-1">
                              {isSearchingAddress &&
                              addressSuggestions.length === 0 ? (
                                <div
                                  className={cn(
                                    "px-4 py-3 text-sm",
                                    isDashboardTone
                                      ? "text-slate-500"
                                      : "text-slate-400",
                                  )}
                                >
                                  Searching addresses...
                                </div>
                              ) : null}

                              {addressSuggestions.map((suggestion, index) => (
                                <button
                                  key={`${suggestion.mapbox_id}-${index}`}
                                  type="button"
                                  className={suggestionItemClassName}
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                    void selectAddressSuggestion(suggestion);
                                  }}
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className={suggestionTitleClassName}>
                                      {suggestion.feature_name}
                                    </p>
                                    <p
                                      className={suggestionDescriptionClassName}
                                    >
                                      {suggestion.description}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ) : (
                  <Input
                    {...field}
                    disabled={isPending}
                    inputMode="text"
                    autoComplete="shipping address-line1"
                    placeholder="Start typing your address"
                    className={inputClassName}
                  />
                )}
                <FieldDescription className={cn("pt-1", descriptionClassName)}>
                  Start typing your address to get suggestions.
                </FieldDescription>
                {fieldState.error ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </FieldContent>
            </Field>
          )}
        />

        {showAddressDetails ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Controller
                control={form.control}
                name="country"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel className={labelClassName}>
                      Country of residence
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Country"
                        className={inputClassName}
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
                    <FieldLabel className={labelClassName}>
                      State / province
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="State"
                        className={inputClassName}
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
                    <FieldLabel className={labelClassName}>
                      City / locality
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="City"
                        className={inputClassName}
                      />
                      {fieldState.error ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : null}
                    </FieldContent>
                  </Field>
                )}
              />
            </div>
          </>
        ) : null}
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
