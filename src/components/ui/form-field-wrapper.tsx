"use client";

import { Controller, Control, FieldValues, Path } from "react-hook-form";
import type { ControllerRenderProps } from "react-hook-form";

import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";

type Props<T extends FieldValues, TName extends Path<T>> = {
  control: Control<T>;
  name: TName;
  label?: string;
  description?: string;
  children: (field: ControllerRenderProps<T, TName>) => React.ReactNode;
};

export function FormFieldWrapper<T extends FieldValues, TName extends Path<T>>({
  control,
  name,
  label,
  description,
  children,
}: Props<T, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid || undefined}>
          {label && <FieldLabel>{label}</FieldLabel>}

          <FieldContent>
            {children(field)}

            {description && !fieldState.error ? (
              <FieldDescription>{description}</FieldDescription>
            ) : null}

            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </FieldContent>
        </Field>
      )}
    />
  );
}
