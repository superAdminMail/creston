"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY_VALUE = "__empty__";

type SuperAdminFormSelectOption = {
  value: string;
  label: string;
};

type SuperAdminFormSelectProps = {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: SuperAdminFormSelectOption[];
  emptyOptionLabel?: string;
};

export function SuperAdminFormSelect({
  name,
  value,
  onValueChange,
  placeholder,
  options,
  emptyOptionLabel,
}: SuperAdminFormSelectProps) {
  const selectValue = value || (emptyOptionLabel ? EMPTY_VALUE : undefined);

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select
        value={selectValue}
        onValueChange={(nextValue) =>
          onValueChange(nextValue === EMPTY_VALUE ? "" : nextValue)
        }
      >
        <SelectTrigger className="super-admin-field h-11 w-full rounded-xl border-border/60 bg-white/90 text-left shadow-sm hover:bg-white/95 focus-visible:ring-blue-400/30 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border border-border/60 bg-white/96 text-slate-950 shadow-[0_18px_50px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-950/96 dark:text-white dark:shadow-[0_18px_50px_rgba(2,6,23,0.36)]">
          {emptyOptionLabel ? (
            <SelectItem value={EMPTY_VALUE}>{emptyOptionLabel}</SelectItem>
          ) : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
