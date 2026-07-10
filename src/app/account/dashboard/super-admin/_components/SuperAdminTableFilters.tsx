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
    <form className="super-admin-shell-panel p-5 sm:p-6">
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
                  className="input-premium h-11 w-full rounded-xl border-border/60 bg-white/90 px-3 text-slate-950 shadow-sm placeholder:text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-400"
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
                <SelectTrigger className="super-admin-field h-11 w-full rounded-xl border-border/60 bg-white/90 text-left shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent className="border-border/60 bg-white/96 text-slate-950 dark:border-white/10 dark:bg-slate-950/96 dark:text-slate-100">
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
