"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_VALUE = "__all__";

type SelectFilterField = {
  kind: "select";
  name: string;
  placeholder: string;
  value?: string;
  options: Array<{ value: string; label: string }>;
};

type TextFilterField = {
  kind: "text";
  name: string;
  placeholder: string;
  value?: string;
};

export type SuperAdminTableFilterField = SelectFilterField | TextFilterField;

type SuperAdminTableFiltersProps = {
  fields: SuperAdminTableFilterField[];
  columnsClassName: string;
};

export function SuperAdminTableFilters({
  fields,
  columnsClassName,
}: SuperAdminTableFiltersProps) {
  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        fields.map((field) => [field.name, field.value ?? ""]),
      ) as Record<string, string>,
    [fields],
  );

  const [values, setValues] = useState<Record<string, string>>(initialValues);

  return (
    <form className="card-premium rounded-[2rem] p-5 sm:p-6">
      {fields.map((field) => (
        <input
          key={field.name}
          type="hidden"
          name={field.name}
          value={values[field.name] ?? ""}
        />
      ))}

      <div className={columnsClassName}>
        {fields.map((field, index) => {
          const isLastField = index === fields.length - 1;

          if (field.kind === "text") {
            return (
              <div key={field.name} className={isLastField ? "flex gap-3" : undefined}>
                <input
                  aria-label={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  className="input-premium h-11 w-full rounded-xl px-3"
                />
                {isLastField ? (
                  <Button type="submit" className="btn-secondary h-11 rounded-xl">
                    Filter
                  </Button>
                ) : null}
              </div>
            );
          }

          const currentValue = values[field.name] ?? "";

          return (
            <div key={field.name} className={isLastField ? "flex gap-3" : undefined}>
              <Select
                value={currentValue || ALL_VALUE}
                onValueChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    [field.name]: value === ALL_VALUE ? "" : value,
                  }))
                }
              >
                <SelectTrigger className="input-premium h-11 w-full rounded-xl border-white/10 bg-white/[0.04] text-left text-slate-100">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#0b1728] text-slate-100">
                  <SelectItem value={ALL_VALUE}>{field.placeholder}</SelectItem>
                  {field.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isLastField ? (
                <Button type="submit" className="btn-secondary h-11 rounded-xl">
                  Filter
                </Button>
              ) : null}
            </div>
          );
        })}
      </div>
    </form>
  );
}
