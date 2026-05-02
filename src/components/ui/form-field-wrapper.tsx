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

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
  children: (field: ControllerRenderProps<T, Path<T>>) => React.ReactNode;
};

export function FormFieldWrapper<T extends FieldValues>({
  control,
  name,
  label,
  description,
  children,
}: Props<T>) {
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
