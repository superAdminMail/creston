"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
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
import { createSavingsProduct } from "@/actions/super-admin/savings-products/createSavingsProduct";
import {
  SavingsProductFormState,
  initialSavingsProductFormState,
} from "@/actions/super-admin/savings-products/savingsProductForm.state";

/* ---------------- SUBMIT BUTTON ---------------- */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="btn-primary rounded-xl px-5"
      disabled={pending}
    >
      {pending ? "Saving..." : "Create Product"}
    </Button>
  );
}

/* ---------------- FORM ---------------- */
export function SavingsProductForm() {
  const router = useRouter();

  const [state, formAction] = useActionState<SavingsProductFormState, FormData>(
    createSavingsProduct,
    initialSavingsProductFormState,
  );

  /* ---------------- EFFECT ---------------- */
  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.refresh();
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        {/* LEFT */}
        <div className="space-y-6">
          {/* PRODUCT INFO */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>

            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <FieldContent>
                    <Input name="name" placeholder="Standard Savings Account" />
                    <FieldError>{state.fieldErrors?.name?.[0]}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <FieldContent>
                    <textarea
                      name="description"
                      className="input-premium min-h-[100px] w-full rounded-xl px-3 py-3"
                      placeholder="Short description..."
                    />
                    <FieldError>{state.fieldErrors?.description?.[0]}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Currency</FieldLabel>
                  <FieldContent>
                    <Input name="currency" defaultValue="USD" />
                    <FieldError>{state.fieldErrors?.currency?.[0]}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Sort Order</FieldLabel>
                  <FieldContent>
                    <Input name="sortOrder" placeholder="0" />
                    <FieldError>{state.fieldErrors?.sortOrder?.[0]}</FieldError>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* BALANCE RULES */}
          <Card>
            <CardHeader>
              <CardTitle>Balance Rules</CardTitle>
            </CardHeader>

            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Minimum Balance</FieldLabel>
                  <FieldContent>
                    <Input name="minBalance" placeholder="0" />
                    <FieldError>{state.fieldErrors?.minBalance?.[0]}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Maximum Balance</FieldLabel>
                  <FieldContent>
                    <Input name="maxBalance" placeholder="100000" />
                    <FieldError>{state.fieldErrors?.maxBalance?.[0]}</FieldError>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* INTEREST */}
          <Card>
            <CardHeader>
              <CardTitle>Interest Settings</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Enable Interest</FieldLabel>
                  <FieldContent>
                    <input
                      type="checkbox"
                      name="interestEnabled"
                      value="true"
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Interest Rate (%)</FieldLabel>
                  <FieldContent>
                    <Input name="interestRatePercent" placeholder="5" />
                    <FieldError>{state.fieldErrors?.interestRatePercent?.[0]}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Payout Frequency</FieldLabel>
                  <FieldContent>
                    <select
                      name="interestPayoutFrequency"
                      className="input-premium rounded-xl px-3 py-2 w-full"
                    >
                      <option value="">Select frequency</option>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                    <FieldError>{state.fieldErrors?.interestPayoutFrequency?.[0]}</FieldError>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* LOCK SETTINGS */}
          <Card>
            <CardHeader>
              <CardTitle>Lock Settings</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Lockable</FieldLabel>
                  <FieldContent>
                    <input type="checkbox" name="isLockable" value="true" />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Minimum Lock Days</FieldLabel>
                  <FieldContent>
                    <Input name="minimumLockDays" placeholder="7" />
                    <FieldError>{state.fieldErrors?.minimumLockDays?.[0]}</FieldError>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Maximum Lock Days</FieldLabel>
                  <FieldContent>
                    <Input name="maximumLockDays" placeholder="90" />
                    <FieldError>{state.fieldErrors?.maximumLockDays?.[0]}</FieldError>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* ACTION */}
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </div>
      </div>
    </form>
  );
}
